import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import { PadiezController } from "./PadiezdModel";
import { MessageController } from "./MessageModel";
import { Controllers } from "../Tools/Controllers";
import { SurveyController } from "./SurveyModel";

let PostSchema = SQuery.Schema({
  client:{
    type:String, // modelPath user / manager / supervisor,
    access:'admin'
  },
  padiezd:{
    type:Schema.Types.ObjectId,
    ref:PadiezController.name,
    strictAlien:true,
    impact:false,
  },
  message: {
    type: Schema.Types.ObjectId,
    ref: MessageController.name,
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
    type:String,
    access:'secret',
    impact:false,
  }],
  statPost:{
    type: {
      likes: Number,
      comments: Number,
      shares: Number,
      commentsCount : Number,
      totalCommentsCount: Number, 
      isLiked:Boolean
    },
    access:'admin',
    default:{
      likes: 0,
      comments: 0,
      shares: 0,
      commentsCount : 0,
      totalCommentsCount: 0, 
      isLiked:false
    }
  },
  theme:{
    type:String
  },
  survey:{
    type:Schema.Types.ObjectId,
    ref:SurveyController.name
  },
  comments: [ {
      type: Schema.Types.ObjectId,
      access:'admin',
      impact:true,
      ref: "post",
    }],
});

export const PostController = new SQuery.ModelController({
  name:'post',
  schema: PostSchema
});

PostController.pre('create',async({ctx})=>{
  ctx.data = {
    ...ctx.data,
    data:{
      client : ctx.signup.modelPath
    }
  }
}).post('read',async ({ctx,more, res},)=>{
  
  const result  = await Controllers.post.services.statPost({
    ...ctx,
    data:{
      postId:ctx.data.id||ctx.data._id
    }
  });
  const rrr =  {
    ...res,
    response:{
      ...JSON.parse(JSON.stringify(res.response)),
      statPost:{
        ...result?.response
      }
    }
  }
  
  return rrr;
})