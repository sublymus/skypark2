import mongoose, { Schema } from "mongoose";
import Log from "sublymus_logger";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import MessageModel from "./MessageModel";

let PostSchema = SQuery.Schema({
    message: {
        type: Schema.Types.ObjectId,
        ref: MessageModel.modelName,
        required: true,
    },
    likeCount: {
        type: Number,
        default: 0,
    },
});

const PostModel = mongoose.model("post", PostSchema);

PostSchema.add(new Schema({
    comments: [{
        type: Schema.Types.ObjectId,
        ref: PostModel.modelName,
    }]
}))

const maker = MakeModelCtlForm({
    schema: PostSchema,
    model: PostModel,
    volatile: true,
});

maker.pre('create',async ({ctx})=>{
    Log('piou',ctx.data)
})
export default PostModel;
