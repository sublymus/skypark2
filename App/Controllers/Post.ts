import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { CtrlManager } from "../../lib/squery/CtrlManager";
import { ControllerSchema, Controllers, ModelControllers, ModelInstanceSchema, ResponseSchema } from "../../lib/squery/Initialize";
import { SQuery } from "../../lib/squery/SQuery";
const Post: ControllerSchema = {
    allUserPost: async (ctx: ContextSchema): ResponseSchema => {
        const arrayData = ModelControllers['post']()['list']?.({
            ...ctx
        })
        return arrayData
    },
  
    statPost: async (ctx: ContextSchema): ResponseSchema => {
        try {
            const { like, newPostData, accountShared, postId } = ctx.data;
            const post = await ModelControllers['post'].option.model.__findOne({ _id: postId });
            if (!post) {
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
            let change = false;

            /*************************     LIKE       ********************** */

            if (like == true) {
                const include = post['like'].find((some_id: any) => {
                    if (some_id.toString() == ctx.login.id) return true;
                })
                if (!include) {
                    post['like'].push(ctx.login.id);
                    change = true;
                    await post.save()
                }
            } else if (like == false) {
                post['like'] = post['like'].filter((some_id: any) => {
                    return !(some_id.toString() == ctx.login.id);
                })||[];
                change = true;
                await post.save()
            }

            /*************************     SHARED      ********************** */
            if (accountShared) {
                const accountSharedInsatance = await ModelControllers['account'].option.model.__findOne({ _id: accountShared });
                if (accountSharedInsatance) {
                    const code = ctx.login.id + ':' + accountShared;
                    const include = post['shared'].find((_code: any) => {
                        if (_code == code) return true;
                    })
                    if (!include) {
                        post['shared'].push(code);
                        await post.save()
                        change = true;
                    }
                }
            }


            /*************************     COMMENT      ********************** */

            let newCommentId: any;
            if (ctx?.login.id && newPostData) {
                const res = await ModelControllers['post']()['list']?.({
                    ...ctx,
                    __permission: 'admin',
                    data: {
                        addNew: newPostData && [newPostData],
                        paging: {
                            query: {
                                __parentModel: 'post' + "_" + postId + "_" + 'comments' + "_post"
                            }
                        }
                    }
                })
                if (!res?.response) return res;
                newCommentId = res.response.added[0];//////
                change = true;
            }

            const res = await SQuery.service('app', 'childList', {
                parentModelPath: 'post', childModelPath: 'post', pagging: {
                }
            }, ctx);
            let data: any = {}
            if (!res?.response) data = {};
            else {
                data = res.response;
            }

            const newParent = (await ModelControllers['post']?.option.model.__findOne({ _id: postId }));
            const commentsCount = newParent?.['comments']?.length || 0;

            let result = undefined;

            if (change) {
                //TODO* Cree un SQuery MOdel Cote server.. avec les modification de donner implicite
                //TODO* Proprieter virtuel
               
                console.log('@@@@@@@@@@@@@@@@@@@' , post['comments'].length);
                
                const res = await ModelControllers['post']()['update']?.({
                    ...ctx,
                    data: {
                        id: postId,
                        statPost: {

                            likes: post['like'].length,
                            comments: post['comments'].length,
                            shares: post['shared'].length,
                            commentsCount,
                            totalCommentsCount: (data?.totalItems) || 0
                        }
                    },
                    __permission: 'admin'
                });
                console.log({res});
                
                result = res?.response
            }
            Log('statis',  result||post)
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: {post:(result || post) , newCommentId},
                status: 200
            }
        } catch (error: any) {
            return {
                error: "OPERATION_FAILED",
                status: 404,
                code: "Post:like|OPERATION_FAILED",
                message: error.message
            }
        }
    }
}

CtrlManager({
    ctrl: { post: Post },
    access: {
        like: "any"
    }
}).pre('comments', async ({ ctx }) => {
    ctx.post = {
        comments: {
            __permission: 'admin'
        }
    }
})