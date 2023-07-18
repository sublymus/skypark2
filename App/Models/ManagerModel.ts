import mongoose, { Schema } from "mongoose";
import { SQueryMongooseSchema } from "../../lib/squery/Initialize";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import UserModel from "./UserModel";
import Log from "sublymus_logger";

const managerSchema = SQuery.Schema({
  ...(UserModel.schema as SQueryMongooseSchema).description,

});
export const ManagerModel = mongoose.model("manager", managerSchema);

const maker = MakeModelCtlForm({
  model: ManagerModel,
  schema: managerSchema
});
maker.pre('create', async ({ ctx, more }) => {
  Log('increate')
  ctx.data.entreprise = more?.__parentModel?.split('_')[1];
});
maker.pre('store', async ({ ctx, more }) => {
  Log('instore')
  ctx.data.entreprise = more?.__parentModel?.split('_')[1];
});
export default ManagerModel;
