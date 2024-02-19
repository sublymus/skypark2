 
import { SQuery } from "../../lib/squery/SQuery";
 
let NotificationSchema = SQuery.Schema({
  elements:[{
   type:{
    triggerAccountId:String, 
    targetPostId :String,
    mode:String,// like , shrared, comment,
    value:String,//bool   accountId  commentId
    checked:Boolean, 
   }
  }],
});

export const NotificationController = new SQuery.ModelController({
  name:'notification',
  schema: NotificationSchema,
});