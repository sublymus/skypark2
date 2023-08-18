//PadiezdModel

import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
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

const PadiezdModel = mongoose.model("padiezd", PadiezdSchema);

const maker = MakeModelCtlForm({
  schema: PadiezdSchema,
  model: PadiezdModel
});

export default PadiezdModel;
