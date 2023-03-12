import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AccountModel from "./AccountModel";
import ArticlModel from "./ArticleModel";
import BuildingModel from "./BuildingModel";

let userSchema = SQuery.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    required: true,
  },
  my_article: {
    type: Schema.Types.ObjectId,
    ref: ArticlModel.modelName,
  },
  building: {
    type: Schema.Types.ObjectId,
    ref: BuildingModel.modelName
  },
  quarter: {
    type: Schema.Types.ObjectId,
    ref: BuildingModel.modelName
  }
});

const UserModel = mongoose.model("user", userSchema);

MakeModelCtlForm({
  model: UserModel,
  schema: userSchema,
  volatile: true,
})


export default UserModel;
