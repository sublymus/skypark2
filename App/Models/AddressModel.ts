import mongoose, { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {BuildingController} from "./BuildingModel";
import {QuarterController} from "./QuarterModel";
import {PadiezController} from "./PadiezdModel";

let addressSchema = SQuery.Schema({

  location: {
    type: String,
    trim: true,
  },
  quarter: {
    type: Schema.Types.ObjectId,
    ref: 'quarter',
    strictAlien: true,
    impact: false
  },
  building: {
    type: Schema.Types.ObjectId,
    ref: BuildingController.name,
    impact: false,
    strictAlien: true,
  },
  room: {
    type: String,
    trim: true,
    emit:true
  },
  city: {
    type: String,
  },
  padiezd: {
    type: Schema.Types.ObjectId,
    ref: PadiezController.name,
    impact: false,
    strictAlien: true,
  },
  etage: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
});

export const AddressController = new SQuery.ModelController({
  name:'address',
  schema: addressSchema,
});
