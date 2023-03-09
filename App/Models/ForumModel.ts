import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import PostModel from "./PostModel";
//import UserModel from "./UserModel";

let ForumSchema = SQuery.Schema({
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    }],
    post:[{
        type: Schema.Types.ObjectId,
        ref: PostModel.modelName,
    }]
});

const ForumModel = mongoose.model("forum", ForumSchema);

MakeCtlForm({
    schema: ForumSchema,
    model: ForumModel,
    volatile: true,
});
export default ForumModel;
