import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ProfileModel from "./ProfileModel";

let ActivitySchema = SQuery.Schema({
  poster: {
    type: Schema.Types.ObjectId,
    ref: ProfileModel.modelName,
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
  description: {
    type: String,
  },
  icons: [{
    required: true,
    type: SQuery.FileType,
    file: {
      size: 800_000,
      type: ['image/png']
    }
  }]
});

const ActivityModel = mongoose.model('activity', ActivitySchema)

MakeModelCtlForm({
  schema: ActivitySchema,
  model: ActivityModel,
  volatile: true

})

export default ActivityModel