//PadiezdModel

import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";

let PadiezdSchema = SQuery.Schema({
  number: {
    type: Number,
    required: true,
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: "user",
    alien: true,
    impact: false,
  }]
});

export const PadiezController = new SQuery.ModelController({
  name:'padiezd',
  schema: PadiezdSchema
});