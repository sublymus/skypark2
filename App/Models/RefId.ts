import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let refIdSchema = SQuery.Schema({

  id: {
    type: String,
  },
  modelPath: {
    type: String,
    required: true,
  },
  data:{
    type:Schema.Types.Mixed
  }

});

const RefIdModel = mongoose.model("refid", refIdSchema);

MakeModelCtlForm({
  schema: refIdSchema,
  model: RefIdModel,
  volatile: true,
});
export default RefIdModel;
