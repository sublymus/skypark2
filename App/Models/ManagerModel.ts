import { SQuery } from "../../lib/squery/SQuery";
import {UserController} from "./UserModel";
import Log from "sublymus_logger";

const ManagerSchema = SQuery.Schema({
  ...UserController.schema.description,

});
export const ManagerController = new SQuery.ModelController({
  name:'manager',
  schema: ManagerSchema,
});

ManagerController.pre('create', async ({ ctx, more }) => {
  Log('increate')
  ctx.data.entreprise = more?.__parentModel?.split('_')[1];
});