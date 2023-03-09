import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AccountModel from "./AccountModel";
import ArticlModel from "./ArticleModel";

let userSchema = SQuery.Schema({

  account: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    required: true,
    //populate: true,
  },
  my_article: {
    type: Schema.Types.ObjectId,
    ref: ArticlModel.modelName,
    //populate: true,
  },
});

const UserModel = mongoose.model("user", userSchema);

const makerCtrl = MakeCtlForm({
  model: UserModel,
  schema: userSchema,
  volatile: true,
  access: 'public'
})
makerCtrl.post('read', (e) => {
  // Log('post', e.res.response?.account)
})
export default UserModel;
