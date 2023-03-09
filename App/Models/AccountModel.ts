import mongoose, { Schema } from "mongoose";
//@ts-ignore
import Log from "sublymus_logger";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AddressModel from "./AddressModel";
import FavoritesModel from "./FavoritesModel";
import ProfileModel from "./ProfileModel";

let accountSchema = SQuery.Schema({

  __permission: {
    type: String,
    default: "user",
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
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    access: "private",
    get: (v: string) => v.length,
    set: (v: string) => v, // crypter
  },
  telephone: {
    type: String,
    required: true,
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: AddressModel.modelName,
    required: true,
    // populate: true,
  },
  favorites: {
    type: Schema.Types.ObjectId,
    ref: FavoritesModel.modelName,
    //access: "private",
    //populate: true,
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: ProfileModel.modelName,
    required: true,
    // populate: true,
  },
  createdDate: {
    type: Number
  },
  updatedDate: {
    type: Number
  },
});

const AccountModel = mongoose.model("account", accountSchema);

const makerCtrl = MakeCtlForm({
  schema: accountSchema,
  model: AccountModel,
  volatile: false,
});

makerCtrl.post("update", (e) => {
  Log("update", e.res);
});

export default AccountModel;
