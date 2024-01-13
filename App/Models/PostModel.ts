import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import { PadiezController } from "./PadiezdModel";
import { MessageController } from "./MessageModel";
import { Controllers } from "../Tools/Controllers";
import { SurveyController } from "./SurveyModel";
import { formatModelInstance } from "../../lib/squery/ModelCtrlManager";
import { UserController } from "./UserModel";
import Log from "sublymus_logger";
import { AccountController } from "./AccountModel";
import { HistoriqueController } from "./Historique";
import { ModelInstanceSchema } from "../../lib/squery/Initialize";

let PostSchema = SQuery.Schema({
  client: {
    type: String, // modelPath user / manager / supervisor,
    access: 'admin'
  },
  padiezd: {
    type: Schema.Types.ObjectId,
    ref: PadiezController.name,
    strictAlien: true,
    impact: false,
  },
  message: {
    type: Schema.Types.ObjectId,
    ref: MessageController.name,
    required: true,
  },
  type: {
    type: String
  },
  like: [{
    type: Schema.Types.ObjectId,
    access: 'secret',
    impact: false,
  }],
  shared: [{
    type: String,
    access: 'secret',
    impact: false,
  }],
  statPost: {
    type: {
      likes: Number,
      comments: Number,
      shares: Number,
      commentsCount: Number,
      totalCommentsCount: Number,
      isLiked: Boolean
    },
    access: 'admin',
    default: {
      likes: 0,
      comments: 0,
      shares: 0,
      commentsCount: 0,
      totalCommentsCount: 0,
      isLiked: false
    }
  },
  theme: {
    type: String
  },
  survey: {
    type: Schema.Types.ObjectId,
    ref: SurveyController.name
  },
  comments: [{
    type: Schema.Types.ObjectId,
    access: 'public',
    impact: true,
    ref: "post",
  }],
});

export const PostController = new SQuery.ModelController({
  name: 'post',
  schema: PostSchema
});

PostController.pre('create', async ({ ctx }) => {
  ctx.data = {
    ...ctx.data,
    data: {
      client: ctx.signup.modelPath
    }
  }
}).post('read', async ({ ctx, more, res },) => {

  const result = await Controllers.post.services.statPost({
    ...ctx,
    data: {
      postId: ctx.data.id || ctx.data._id
    }
  });
  const rrr = {
    ...res,
    response: {
      ...JSON.parse(JSON.stringify(res.response)),
      statPost: {
        ...result?.response
      }
    }
  }

  return rrr;
}).post('create', async ({ ctx, res }) => {
  if (!res.response) return res 
  const account = await AccountController.model.findOne({_id:ctx.login.id});
  const historique = await HistoriqueController.model.findOne({_id:account?.historique});
  const post = await PostController.model.findOne({ _id: res.response });
  Log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@','ok');
  if(post)post.__parentList = undefined
  const data =  await formatModelInstance({
    ...ctx,
    service:'read'
  },PostController,post as any as ModelInstanceSchema,2,true);
  
  await data.populate({
    path:'message',
    select:'text _id account files targets status',
  })
  Log('data',data)
  if(post) Log('INFO',{ modelName:'post', id: res.response,mode:'create' ,value:'true',data});
  
  //@ts-ignore
  historique?.elements?.unshift({ modelName:'post', id: res.response,mode:'create' ,value:'true',data});
  historique?.save();
  // if (!res.error) {
  //   const post = await PostController.model.findOne({ _id: res.response });
  //   const user = await UserController.model.findOne({ _id: ctx.signup.id });
  //   //@ts-ignore
  //   const promises = post?.__parentList?.filter((d) => d.modelPath == 'post').map((d) => {
  //     return new Promise(async (rev, rej) => {
  //       const res = await PostController.services.read({ ...ctx, data: { id: d.id } });
  //       if (res?.response) return rev(res.response);
  //       rev(null);
  //     });
  //   })
  //   //@ts-ignore
  //   const data = promises && ((await Promise.allSettled(promises)).map(v => v.value).filter(v=>v!=null&&v!=undefined));
  //   Log("DATA",data);
  //   user?.activity?.push({
  //     //@ts-ignore
  //     mode: 'post',
  //     //@ts-ignore
  //     data: [...data, await formatModelInstance(ctx,PostController,post,1)],
  //     //@ts-ignore
  //     date: Date.now()
  //   });
  //   await user?.save();
  //   Log('USER', user)
  // } 
})