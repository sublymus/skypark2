import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
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
    access:'private',
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: AddressModel.modelName,
    required: true,
  },
  favorites: {
    type: Schema.Types.ObjectId,
    ref: FavoritesModel.modelName,
    access: "private",
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: ProfileModel.modelName,
    required: true,
  },
});

const AccountModel = mongoose.model("account", accountSchema);

const ctrlMaker = MakeModelCtlForm({
  schema: accountSchema,
  model: AccountModel,
  volatile: false,
});

ctrlMaker.pre('read', async (e) => {
  await new Promise((rev => {
    const d = Date.now() + 100;
    const t = () => {
      console.log(Date.now());
      if (d < Date.now()) {
        return rev(d);
      }
      setTimeout(t, 10)
    }
    t()
  }))
})
ctrlMaker.post('read', async (e) => {
  await new Promise((rev => {
    const d = Date.now() + 100
    const t = () => {
      console.log('_________________' + Date.now());
      if (d < Date.now()) {
        return rev(d);
      }
      setTimeout(t, 10)
    }
    t()

  }))
})

export default AccountModel;
