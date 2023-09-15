import mongoose, { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import { PadiezController } from "./PadiezdModel";

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
    ref: PadiezController.name,
    access:'admin',
  }],
  
});

export const BuildingController = new SQuery.ModelController({
  name:'building',
  schema: buildingSchema,
});

