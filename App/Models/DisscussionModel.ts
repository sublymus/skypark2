import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ChannelModel from "./ChannelModel";
let DisscussionSchema = SQuery.Schema({
   channel: {
    type: Schema.Types.ObjectId,
    ref: ChannelModel.modelName,
  },
});

const DisscussionModel = mongoose.model('disscussion', DisscussionSchema)

MakeModelCtlForm({
    schema: DisscussionSchema,
    model: DisscussionModel,
    volatile: true
})

export default DisscussionModel