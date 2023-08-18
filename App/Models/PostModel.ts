import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import MessageModel from "./MessageModel";
import PadiezdModel from "./PadiezdModel";

let PostSchema = SQuery.Schema({
  client:{
    type:String, // modelPath user / manager / supervisor,
    access:'admin'
  },
  padiezd:{
    type:Schema.Types.ObjectId,
    ref:PadiezdModel.modelName,
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
    },
    access:'admin',
    default:{
      likes: 0,
      comments: 0,
      shares: 0
    }
  },
  theme:{
    type:String
  },
  comments: [ {
      type: Schema.Types.ObjectId,
      access:'public',
      impact:true,
      ref: "post",
    }],
});

const PostModel = mongoose.model("post", PostSchema);

const maker = MakeModelCtlForm({
  schema: PostSchema,
  model: PostModel
});
maker.pre('create',async({ctx})=>{
  ctx.data = {
    ...ctx.data,
    data:{
      client : ctx.signup.modelPath
    }
  }
})


export default PostModel;

