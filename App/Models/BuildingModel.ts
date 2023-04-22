import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ChannelModel from "./ChannelModel";

let buildingSchema = SQuery.Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      strictAlien: true,
      impact: false,
    },
  ],
  Thread: {
    type: Schema.Types.ObjectId,
    ref: ChannelModel.modelName,
    alien: true,
  },
  // activities: [{
  //     type: Schema.Types.ObjectId,
  //     ref: ActivityModel.modelName,
  // }]
});

const BuildingModel = mongoose.model("building", buildingSchema);

const maker = MakeModelCtlForm({
    schema: buildingSchema,
    model: BuildingModel,
    volatile: true,
});

export default BuildingModel;
