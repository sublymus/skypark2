import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ChannelModel from "./ChannelModel";
import ProfileModel from "./ProfileModel";

let ActivitySchema = SQuery.Schema({
  poster: {
    type: Schema.Types.ObjectId,
    ref: ProfileModel.modelName,
    required: true,
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: ChannelModel.modelName,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  }
});

const ActivityModel = mongoose.model('activity', ActivitySchema)

MakeModelCtlForm({
  schema: ActivitySchema,
  model: ActivityModel,
  volatile: true

})

export default ActivityModel