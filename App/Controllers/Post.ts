import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { SaveCtrl } from "../../lib/squery/CtrlManager";
import { ControllerSchema , Controllers, ModelControllers, ModelInstanceSchema, ResponseSchema } from "../../lib/squery/Initialize";

const Post: ControllerSchema ={
    like:async(ctx:ContextSchema): ResponseSchema=>{
        try {
            const {like , postId} = ctx.data;
            const post :ModelInstanceSchema = await ModelControllers['post'].option.model.findOne({_id:postId});
            post['like'] = [...(post['like']||[])];
            if(!post){
                return {
                    error: "NOT_FOUND",
                    status: 404,
                    code: "ERROR|Post:like|NOT_FOUND",
                    message:"Post not found"
                }
            }
            const getUserId = async (ctx:ContextSchema):Promise<string>=>{
                const currentUser = await ModelControllers[ctx.signup.modelPath].option.model.findOne({ _id: ctx.signup.id });
                if (!currentUser) {
                    throw new Error("CurrentUser don't exist");
                }
                return currentUser._id.toString()
            }
            if(like == true){
                if((!!ctx.signup?.id)){
                    /** on recupere le  sender(UserModel)*/
                    let include = false;
                    const userId = await getUserId(ctx);
                    post['like'].forEach((some_id:any) => {
                        if(some_id.toString() == userId) include = true;
                    }) 
                    if(!include){
                        post['like'].push(userId);
                        Log('Like_Push','%%%% true %%%%%%')
                        await post.save();
                        Log('Like_Save','%%%%% true %%%%%')
                    }
                   
                }
            }else if(like == false){
                if(!!ctx.signup?.id){
                    /** on recupere le  sender(UserModel)*/
                    const userId = await getUserId(ctx);
                    post['like'] = post['like'].filter((some_id:any) => {
                        return !(some_id.toString() == userId);
                    });
                    Log('Like_Push','%%%%% false %%%%%')
                    await post.save();
                    Log('Like_Save','%%%%% false %%%%%')
                }
            }
            Log('post',  post)
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response:  post['like'].length ,
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


const ctrlMaker = SaveCtrl({
    ctrl: { Post },
    access: {
        like: "any"
    }
})


ctrlMaker.pre('like', async (e) => {})
ctrlMaker.post('like', async (e) => {})
