import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AccountModel from "./AccountModel";
import MessengerModel from "./MessengerModel";

let userSchema = SQuery.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    //  required: true,
  },
  messenger: {
    type: Schema.Types.ObjectId,
    ref: MessengerModel.modelName,
    //strictAlien: true,//TODO retirer
  }
});

const UserModel = mongoose.model("user", userSchema);

MakeModelCtlForm({
  model: UserModel,
  schema: userSchema,
  volatile: true,
})


export default UserModel;
