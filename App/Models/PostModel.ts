import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import MessageModel from "./MessageModel";

let PostSchema = SQuery.Schema({
  client:{
    type:String // modelPath user / manager / supervisor
  },
  padiezd:{
    type:Schema.Types.ObjectId,
    strictAlien:true,
    impact:false,
  },
  message: {
    type: Schema.Types.ObjectId,
    ref: MessageModel.modelName,
    required: true,
  },
  type:{
    type:String
  },
  like:[{
    type:Schema.Types.ObjectId,
    access:'secret',
    impact:false,
  }],
  shared:[{
    type:Schema.Types.ObjectId,
    access:'secret',
    impact:false,
  }],
  statPost:{
    type: {
      likes: Number,
      comments: Number,
      shares: Number
    }
  },
  comments: [ {
      type: Schema.Types.ObjectId,
      access:'admin',
      ref: "post",
    }],
});

const PostModel = mongoose.model("post", PostSchema);

const maker = MakeModelCtlForm({
  schema: PostSchema,
  model: PostModel
});


export default PostModel;

