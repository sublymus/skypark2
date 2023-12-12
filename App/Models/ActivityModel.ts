import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import { ProfileController } from "./ProfileModel";
import Log from "sublymus_logger";

let ActivitySchema = SQuery.Schema({
  poster: {
    type: Schema.Types.ObjectId,
    ref: ProfileController.name,
    required: true,
  },
  channel: [{
    type: Schema.Types.ObjectId,
    ref: 'post',
    access: 'public',
    impact: true,
  }],
  name: {
    type: String,
    required: true,
  },
  listAbonne: [{
    type: String,
    access: 'secret'
  }],
  //TODO a retirer et remplacer par les proprieter virtuel
  listen:{
    type:Boolean,
  },
  description: {
    type: String,
  },
  icons: [{
    type: SQuery.FileType,
    // required: true,
    file: {
      size: 800_000,
      type: ['image/png']
    }
  }]
});

export const ActivityController = new SQuery.ModelController({
  name: 'activity',
  schema: ActivitySchema,
});

ActivityController.post('read', async ({ ctx , res }) => {
  const activity = await ActivityController.model.findOne({
    _id:ctx.data.id
  });
  if(!activity) return;
  const exist = activity.listAbonne?.find((v)=>{
    return v == ctx.login.id;
  });

return {
  ...res,
   response:{
      ...res.response?._doc,
      listen:!!exist
   }
}

})
ActivityController.pre('update', async ({ ctx, more}) => {
  if (ctx.data.listen != undefined) {
    const activity = await ActivityController.model.findOne({
      _id:ctx.data.id
    });
    if(!activity) return;
    if(ctx.data.listen==true||ctx.data.listen == 'true'){
      delete ctx.data.listen
      Log('@@@@@@@@@@@',activity)
      //@ts-ignore
      activity.listAbonne = [...activity.listAbonne, ctx.login.id];
      await activity.save();
    }else{
      delete ctx.data.listen
      activity.listAbonne =[...activity.listAbonne?.filter((v)=>{
        return v != ctx.login.id
      })]
      
      await activity.save();
    }
  }
})