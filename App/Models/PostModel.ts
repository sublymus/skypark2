import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import MessageModel from "./MessageModel";

let PostSchema = SQuery.Schema({
    message:{
        type:Schema.Types.ObjectId,
        ref:MessageModel.modelName,
    },
    likeCount:{
        type:Number,
    },
});

const PostModel = mongoose.model("post", PostSchema);

PostSchema.add(new Schema({
    comments:[{
        type: Schema.Types.ObjectId,
        ref: PostModel.modelName,
    }]
}))

MakeCtlForm({
    schema: PostSchema,
    model: PostModel,
    volatile: true,
});
export default PostModel;
