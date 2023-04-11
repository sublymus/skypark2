import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ActivityModel from "./ActivityModel";
import ChannelModel from "./ChannelModel";
let CommunitySchema = SQuery.Schema({
    name: {
        type: String,
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      strictAlien: true,
    }],
    Thread: {
        type: Schema.Types.ObjectId,
        ref: ChannelModel.modelName,
      },
    activities: [{
        type: Schema.Types.ObjectId,
        ref: ActivityModel.modelName,
    }]
});

const CommunityModel = mongoose.model('community', CommunitySchema)

MakeModelCtlForm({
    schema: CommunitySchema,
    model: CommunityModel,
    volatile: false
})

export default CommunityModel