
import { LabelController } from './../Models/LabelModel';
import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { ModelControllerInterface, ModelInstanceSchema, ResponseSchema, superD } from "../../lib/squery/Initialize";
import { SQuery } from "../../lib/squery/SQuery";
import { Local } from "../../lib/squery/SQuery_init";
import { ModelControllers } from "../Tools/ModelControllers";
import { EXIST_BREAKER } from "../Tools/Breaker";
import { PostController as PostModelCTRL } from './../Models/PostModel';
import { SurveyController } from "../Models/SurveyModel";
import mongoose from 'mongoose';
import { ModelController } from '../../lib/squery/SQuery_ModelController';
import { AccountController } from '../Models/AccountModel';
import { Controllers } from '../Tools/Controllers';
import { HistoriqueController } from '../Models/Historique';
import { formatModelInstance } from '../../lib/squery/ModelCtrlManager';
type DOC<Ctrl extends ModelControllerInterface<any, any, any, any>> = Ctrl extends ModelController<any, any, infer DES> ? mongoose.Document<any, any, superD<DES>> & superD<DES> & { [k: string]: any } : ModelController<any, any, any>
export const PostController = new SQuery.Controller({
    name: 'post',
    services: {
        allUserPost: async (ctx: ContextSchema): ResponseSchema => {
            const arrayData = Local.ModelControllers['post']?.services['list']?.({
                ...ctx
            })
            return arrayData
        },

        survey: async (ctx) => {
            try {
                const { postId, labelId } = ctx.data;
                const post = await PostModelCTRL.model.findOne({ _id: postId });
                //Log('post', EXIST_BREAKER(ctx, post))
                if (!EXIST_BREAKER(ctx, post)) return;
                Log('ctx?.login?.id', ctx?.login?.id)
                if (!ctx?.login?.id) {
                    throw new Error("CurrentUser don't exist");
                }
                Log('labelId', labelId)
                if (!labelId) {
                    throw new Error("Label don't exist");
                }


                const survey = await SurveyController.model.findOne({ _id: post.survey?.toString() });

                if (!survey?.options) return;
                if (((survey?.__createdAt || 0) + (survey?.delay || 0)) < Date.now()) return;

                Log('survey', survey)
                const labelsPromise = survey.options.map(async (vote) => {
                    return LabelController.model.findOne({ _id: vote.toString() }) || null
                })
                const l = new LabelController.model({})
                const result = await Promise.allSettled(labelsPromise);
                Log('result', result)

                const labels = result
                    .filter((data) => {
                        return data.status == 'fulfilled';
                    })
                    .map((data) => {
                        //@ts-ignore
                        return data.value as DOC<typeof LabelController>;
                    });
                let lastLabel = '';
                let newLabel = '';
                const changedLabel: { [k: string]: DOC<typeof LabelController> } = {};

                let totalVotes = 0;

                for (const label of labels) {
                    totalVotes += label.clients?.length || 0;
                    if (!lastLabel) {

                        const newClients = label.clients?.filter(vote => {
                            const r = ctx.login.id + ':' + label._id?.toString() != vote;
                            Log('@@@', { r, lastLabel, vote, b: !lastLabel && !r })
                            if (!lastLabel && !r) {
                                lastLabel = vote;
                            }
                            return r;
                        });
                        Log('newClients', { newClients, lastLabel })
                        if (lastLabel) {

                            label.clients = newClients;
                            label.votes = newClients?.length
                            changedLabel[label._id.toString()] = label;
                        }
                    }
                    if (label._id?.toString() == labelId) {
                        const vote = ctx.login.id + ':' + labelId;
                        label.clients?.push(vote);
                        label.votes = label.clients?.length
                        changedLabel[label._id.toString()] = label;
                        newLabel = vote;
                    }
                }
                for (const key in changedLabel) {
                    if (Object.prototype.hasOwnProperty.call(changedLabel, key)) {
                        const label = changedLabel[key];
                        Log('length', label);
                        await label.save();
                    }
                }
                Log('length', survey?.__createdAt, survey?.delay, Date.now());
                let limite = (survey?.__createdAt || 0) + (survey?.delay || 0) - Date.now()
                limite = limite < 0 ? 0 : limite
                return {
                    response: {
                        newLabel,
                        lastLabel,
                        totalVotes,
                        delay: limite,
                        limiteDate: (survey?.__createdAt || 0) + (survey?.delay || 0)
                    },
                    status: 200,
                    message: 'ok',
                    code: 'ok'
                }
            } catch (error: any) {
                return {
                    error: "OPERATION_FAILED",
                    status: 404,
                    code: "Post:Survey|OPERATION_FAILED",
                    message: error
                }
            }
        },
        statPost: async (ctx: ContextSchema): ResponseSchema => {
            try {
                console.log(ctx.data);

                const { like, newPostData, accountShared, postId, favorite } = ctx.data;
                const post = await PostModelCTRL.model.findOne({ _id: postId });
                
                if (!post ) {
                    return {
                        error: "NOT_FOUND",
                        status: 404,
                        code: "ERROR|Post:like|NOT_FOUND",
                        message: "Post not found"
                    }
                }
               
                if (!ctx.login.id) {
                    throw new Error("CurrentUser don't exist");
                }
                const account = await AccountController.model.findOne({_id:ctx.login.id});
                const historique = await HistoriqueController.model.findOne({_id:account?.historique});
                let change = false;

                const datas:{modelName:string,value:string,mode:string,id:string,data:any}[]= [];
                /*************************     LIKE       ********************** */

                if (like == true) {
                    const include = post.like?.find((some_id: any) => {
                        if (some_id.toString() == ctx.login.id) return true;
                    })
                    if (!include) {
                        post['like']?.push(ctx.login.id);
                        change = true;
                        datas.push({
                            modelName:'post',
                            id:postId,
                            mode:'like',
                            value:'true',
                            data:{}
                        })
                    }
                } else if (like == false) {
                    const include = post.like?.find((some_id: any) => {
                        if (some_id.toString() == ctx.login.id) return true;
                    })
                    if (include) {
                        datas.push({
                            modelName:'post',
                            id:postId,
                            mode:'like',
                            value:'false',
                            data:{}
                        })
                    }
                    post['like'] = post['like']?.filter((some_id: any) => {
                        return !(some_id.toString() == ctx.login.id);
                    }) || [];
                    change = true;
                    
                   
                }

                /*************************     SHARED      ********************** */
                if (accountShared) {
                    const accountSharedInsatance = await AccountController.model.findOne({ _id: accountShared });
                    if (accountSharedInsatance) {
                        const code = ctx.login.id + ':' + accountShared;
                        const include = post['shared']?.find((_code: any) => {
                            if (_code == code) return true;
                        })
                        if (!include) {
                            post['shared']?.push(code);
                            await post.save()
                            change = true;
                            datas.push({
                                modelName:'post',
                                id:postId,
                                mode:'shared',
                                value:accountShared,
                                data:{}
                            });
                        }
                    }
                }
                if(historique){
                    //@ts-ignore
                    historique.elements= [...datas, historique.elements];
                    try {
                        historique.save();
                    } catch (error) {
                        
                    }
                }
                /*************************    FAVORITES    ***********************/
                const favorites = await ModelControllers['favorites'].model.findOne({ _id: account?.favorites?.toString() });
                if (favorites) {

                    if (favorite == true) {
                        //@ts-ignore
                        favorites.elements = [...favorites.elements, {
                            //@ts-ignore
                            id: post._id.toString(),
                            //@ts-ignore
                            modelName: 'post'
                        }]
                    }

                    if (favorite == false) {
                        //@ts-ignore
                        favorites.elements = [...favorites.elements?.filter((val) => {
                            //@ts-ignore
                            return val.id != post._id.toString();
                        })]
                    }
                    await favorites?.save()
                }

                /************     CHANGE     */
                if (change) {
                    await post.save();
                }
                /*************************     COMMENT      ********************** */

                let newComment: DOC<typeof PostModelCTRL> | null = null;
                if (ctx?.login.id && newPostData) {
                    const res = await PostModelCTRL.services['list']?.({
                      /*************************     COMMENT      ********************** */   ...ctx,
                        __permission: 'admin',
                        data: {
                            addNew: [newPostData],
                            paging: {
                                query: {
                                    __parentModel: 'post' + "_" + postId + "_" + 'comments' + "_post"
                                }
                            }
                        }
                    })
                    console.log('res****', res);

                    if (!res?.response) return res;
                    newComment = await PostModelCTRL.model.findOne({ _id: res.response.added[0] });//////
                    change = true;
                }

                const res = await Local.Controllers['app'].services['childList']({
                    ...ctx,
                    data: {
                        parentId: postId, parentModelPath: 'post', childModelPath: 'post', pagging: {
                        }
                    }
                });
                let data: any = {}
                if (!res?.response) data = {};
                else {
                    data = res.response;
                }

                let result = {
                    newCommentId: newComment?._id.toString(),
                    likes: post.like?.length,
                    comments: post['comments']?.length,
                    shares: post['shared']?.length,
                    totalCommentsCount: (data?.totalItems) || 0,
                    isLiked: like || !!post['like']?.find((some_id: any) => {
                        if (some_id.toString() == ctx.login.id) return true;
                    }) || false
                };

                return {
                    code: "OPERATION_SUCCESS",
                    message: "OPERATION_SUCCESS",
                    response: result,
                    status: 200
                }
            } catch (error: any) {
                console.log(error);
                
                return {
                    error: "OPERATION_FAILED",
                    status: 404,
                    code: "Post:like|OPERATION_FAILED",
                    message: error.message
                }
            }
        }
    }
});
