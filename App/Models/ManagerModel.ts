import mongoose, { Schema } from "mongoose";
import { SQuerySchemaType } from "../../lib/squery/Initialize";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import UserModel from "./UserModel";
import Log from "sublymus_logger";

const managerSchema = SQuery.Schema({
  ...(UserModel.schema as SQuerySchemaType).description,
  entreprise: {
    type: Schema.Types.ObjectId,
    ref: 'entrepise',
  }
});
Log('managerSchema',managerSchema.description);
export const ManagerModel = mongoose.model("manager", managerSchema);

const maker = MakeModelCtlForm({
  model: ManagerModel,
  schema: managerSchema,
  volatile: true,
});


export default ManagerModel;
