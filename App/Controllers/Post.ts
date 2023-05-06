import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { CtrlManager } from "../../lib/squery/CtrlManager";
import { ControllerSchema, Controllers, ModelControllers, ModelInstanceSchema, ResponseSchema } from "../../lib/squery/Initialize";
const Post: ControllerSchema = {
    allUserPost:async (ctx: ContextSchema): ResponseSchema => {
    const arrayData = ModelControllers['post']()['list']({
        ...ctx
    })
        return arrayData
    },
    comments: async (ctx: ContextSchema): ResponseSchema => {
        const { modelPath , id, property, newPostData } = ctx.data;
        const parent: ModelInstanceSchema = await ModelControllers[modelPath]?.option.model.findOne({ _id: id });
        if(!parent) return  {
            error: "NOT_FOUND",
            code: "NOT_FOUND",
            message: "Post don't exist",
            status: 404,
        }
        parent[property] = [...(parent[property] || [])];
        let newCommentId :any;
        if(ctx?.login.id){
            const res = await ModelControllers['post']()['list']({
                ...ctx,
                __permission: ctx[modelPath]?.[property]?.__permission||ctx.__permission,
                data: {
                    addNew: newPostData? [newPostData]:undefined,
                    paging: {
                        query: {
                            __parentModel: modelPath+"_" + id + "_"+property+"_post"
                        }
                    }
                }
            })
            if(res.error) return res;
            newCommentId = res.response.added;
        }
        const deep = async (parent:ModelInstanceSchema , property:string, data: { allComments: number }) => {
            try {
                if (parent?.[property]?.toString() && Array.isArray(parent[property])) {
                    data.allComments += parent[property].length;
                    const promise =parent[property].map((postId: any) => {
                        return new Promise(async (rev) => {
                            const post: ModelInstanceSchema = await ModelControllers['post'].option.model.findOne({ _id: postId });
                            await deep(post,'comments', data);
                            rev('');
                        })
                    });
                    (await Promise.allSettled(promise));
                }
            } catch (error) {
                return;
            }
        }
        let data = {
            allComments: 0,
        }
        const newParent = ( await ModelControllers[modelPath]?.option.model.findOne({ _id: id }));
        await deep(newParent , property, data);
        const commentsCount = newParent?.[property]?.length||0;
        
        return {
            code: "OPERATION_SUCCESS",
            message: "OPERATION_SUCCESS",
            response: {
                commentsCount,
                newCommentId,
                totalCommentsCount: data.allComments
            },
            status: 200
        }
    },
    like: async (ctx: ContextSchema): ResponseSchema => {
        try {
            const { like, postId } = ctx.data;
            const post: ModelInstanceSchema = await ModelControllers['post'].option.model.findOne({ _id: postId });
            post['like'] = [...(post['like'] || [])];
            if (!post) {
                return {
                    error: "NOT_FOUND",
                    status: 404,
                    code: "ERROR|Post:like|NOT_FOUND",
                    message: "Post not found"
                }
            }
            const getUserId = async (ctx: ContextSchema): Promise<string> => {
                const currentUser = await ModelControllers[ctx.signup.modelPath].option.model.findOne({ _id: ctx.signup.id });
                if (!currentUser) {
                    throw new Error("CurrentUser don't exist");
                }
                return currentUser._id.toString()
            }
            if (like == true) {
                if ((!!ctx.signup?.id)) {
                    /** on recupere le  sender(UserModel)*/
                    let include = false;
                    const userId = await getUserId(ctx);
                    post['like'].forEach((some_id: any) => {
                        if (some_id.toString() == userId) include = true;
                    })
                    if (!include) {
                        post['like'].push(userId);
                        Log('Like_Push', '%%%% true %%%%%%')
                        await post.save();
                        Log('Like_Save', '%%%%% true %%%%%')
                    }

                }
            } else if (like == false) {
                if (!!ctx.signup?.id) {
                    /** on recupere le  sender(UserModel)*/
                    const userId = await getUserId(ctx);
                    post['like'] = post['like'].filter((some_id: any) => {
                        return !(some_id.toString() == userId);
                    });
                    Log('Like_Push', '%%%%% false %%%%%')
                    await post.save();
                    Log('Like_Save', '%%%%% false %%%%%')
                }
            }
            Log('post', post)
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: post['like'].length,
                status: 200
            }
        } catch (error) {
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
    ctrl: { Post },
    access: {
        like: "any"
    }
}).pre('comments', async ({ctx}) => {
    ctx.post = {
        comments:{
            __permission:'admin'
        }
    }
 })