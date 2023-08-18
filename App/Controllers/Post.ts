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
    comments: async (ctx: ContextSchema): ResponseSchema => {
        const { id, newPostData } = ctx.data;
        const parent: ModelInstanceSchema | null = await ModelControllers['post']?.option.model.findOne({ _id: id });
        if (!parent) return {
            error: "NOT_FOUND",
            code: "NOT_FOUND",
            message: "Post don't exist",
            status: 404,
        }

        let newCommentId: any;
        if (ctx?.login.id && newPostData) {
            const res = await ModelControllers['post']()['list']?.({
                ...ctx,
                //  __permission: ctx[modelPath]?.[property]?.__permission||ctx.__permission,
                data: {
                    addNew: newPostData && [newPostData],
                    paging: {
                        query: {
                            __parentModel: 'post' + "_" + id + "_" + 'comments' + "_post"
                        }
                    }
                }
            })
            if (!res?.response) return res;
            newCommentId = res.response.added;
        }

        const res = await SQuery.service('app', 'childList', {
            parentModelPath: 'post', childModelPath: 'post', pagging: {
            }
        }, ctx);
        let data: any = {}
        Log('res', { res })
        if (!res?.response) data = {};
        else {
            data = res.response;
        }

        const newParent = (await ModelControllers['post']?.option.model.__findOne({ _id: id }));
        const commentsCount = newParent?.['comments']?.length || 0;

        return {
            code: "OPERATION_SUCCESS",
            message: "OPERATION_SUCCESS",
            response: {
                commentsCount,
                newCommentId,
                totalCommentsCount: (data?.totalItems) || 0
            },
            status: 200
        }
    },
    like: async (ctx: ContextSchema): ResponseSchema => {
        try {
            const { like, postId } = ctx.data;
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
            if (like == true) {
                console.log('2345678', 'ok in true');
                const include = post['like'].find((some_id: any) => {
                    if (some_id.toString() == ctx.login.id) return true;
                })
                if (!include) {
                    post['like'].push(ctx.login.id);
                    await post.save();
                }
            } else if (like == false) {
                console.log('2345678', 'ok in false');
                post['like'] = post['like'].filter((some_id: any) => {
                    return !(some_id.toString() == ctx.login.id);
                });
                await post.save();
            }

            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: post['like'].length,
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