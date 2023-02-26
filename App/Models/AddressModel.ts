import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import BuildingModel from "./BuildingModel";

let addressSchema = SQuery.Schema({
  __key: {
    type: Schema.Types.ObjectId,
    required: true,
    access: 'secret'
  },
  location: {
    type: String,
    trim: true,
    required: true,
  },
  building: {
    type: Schema.Types.ObjectId,
    ref: BuildingModel.modelName, 
    required: true,
  },
  room: {
    type: String,
    trim: true,
    required: true,
  },
  door: {
    type: String,
    trim: true,
    required: true,
  },
  etage: {
    type: String,
    trim: true,
    required: true,
  },
  description:{
    type: String,
    trim: true,
    required: true,
  },
  updatedDate: {
    type: Number,
    required: true,
  },
});

const AddressModel = mongoose.model("address", addressSchema);

MakeCtlForm({
  schema: addressSchema,
  model: AddressModel,
  modelPath: 'address',
  volatile:false,
});

export default AddressModel;
