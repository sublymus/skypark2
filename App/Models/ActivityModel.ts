import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ForumModel from "./ForumModel";
import ProfileModel from "./ProfileModel";

let ActivitySchema = SQuery.Schema({
  poster: {
    type: Schema.Types.ObjectId,
    ref: ProfileModel.modelName,
    required:true,
  },
  forum:{
    type:Schema.Types.ObjectId,
    ref:ForumModel.modelName,
  },
  name:{
    type:String,
    required:true,
  },
  description:{
    type:String,
  }
});

const ActivityModel = mongoose.model('activity', ActivitySchema)

MakeModelCtlForm({
  schema: ActivitySchema,
  model: ActivityModel,
  volatile: true

})

export default ActivityModel