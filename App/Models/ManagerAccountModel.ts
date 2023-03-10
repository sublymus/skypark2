import mongoose, { Model, Schema } from "mongoose";
//@ts-ignore
import { MakeModelCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
//import Aes from "ezcryption/dist/aes";

let managerAccountSchema = SQuery.Schema({
  __permission: {
    type: String,
    access: "secret",
  },
  name: {
    type: String,
    trim: true,
    minlength: [3, "trop court"],
    maxlength: [20, "trop long"],
    required: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    access: "private",
  },
  phone: {
    type: String,
    required: true,
  },

});

export const ManagerAccountModel = mongoose.model(
  "manageraccount",
  managerAccountSchema
);

MakeModelCtlForm({
  schema: managerAccountSchema,
  model: ManagerAccountModel,
  volatile: false,
});

export default ManagerAccountModel;
