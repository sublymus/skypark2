import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import MessageModel from "./MessageModel";

let PostSchema = SQuery.Schema({
  message: {
    type: Schema.Types.ObjectId,
    ref: MessageModel.modelName,
    required: true,
  },
  like:[{
    type:Schema.Types.ObjectId,
    access:'secret',
    impact:false,
    required:true,
    default:[],
  }],
  comments: [ {
      type: Schema.Types.ObjectId,
      access:'admin',
      ref: "post",
      required:true,
      default:[],
    }],
});

const PostModel = mongoose.model("post", PostSchema);

const maker = MakeModelCtlForm({
  schema: PostSchema,
  model: PostModel,
  volatile: true,
});


export default PostModel;
