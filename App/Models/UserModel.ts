import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import AccountModel from "./AccountModel";

let userSchema = new Schema({
  __key: {
    type: Schema.Types.ObjectId,
    require: true,
    access: 'secret'
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    require: true,
    populate: true,
  },
});

const UserModel = mongoose.model("user", userSchema);

const makerCtrl = MakeCtlForm({
  model: UserModel,
  modelPath: "user",
  schema: userSchema,
  volatile: true,
  access : 'public'
})
makerCtrl.post('read', (e) => {
  // Log('post', e.res.response?.account)
})
export default UserModel;
