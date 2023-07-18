import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import PadiezdModel from "./PadiezdModel";

let buildingSchema = SQuery.Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  padiezdList: [{
    type: Schema.Types.ObjectId,
    ref: PadiezdModel.modelName,
    access:'admin',
  }],
  
});

const BuildingModel = mongoose.model("building", buildingSchema);

const maker = MakeModelCtlForm({
  schema: buildingSchema,
  model: BuildingModel
});

export default BuildingModel;
