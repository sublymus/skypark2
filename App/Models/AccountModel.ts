import mongoose, { Schema } from "mongoose";
import { ContextSchema } from "../../lib/squery/Context";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AddressModel from "./AddressModel";
import FavoritesModel from "./FavoritesModel";
import ProfileModel from "./ProfileModel";
let accountSchema = SQuery.Schema({
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
  userTarg: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    access: "private",
    // get: (v) => (v as String).length,
    // set: (v) => v, // crypter
  },
  telephone: {
    type: String,
    required: true,
    access: "private",
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: AddressModel.modelName,
  },
  favorites: {
    type: Schema.Types.ObjectId,
    ref: FavoritesModel.modelName,
    access: "private",
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: ProfileModel.modelName,
  },
});

const AccountModel = mongoose.model("account", accountSchema);

const maker = MakeModelCtlForm({
  schema: accountSchema,
  model: AccountModel,
  volatile: false,
})
maker.pre("store", async function youyou ({ ctx })  {
  const userTarg = getTarg(ctx);
  const account = await AccountModel.findOne({
    userTarg: userTarg,
  });
  if (account) {
    ctx.data.userTarg = getTarg(ctx);
  } else {
    ctx.data.userTarg = userTarg;
  }
});

function getTarg(ctx: ContextSchema) {
  const targ = ctx.data?.email?.substring(
    0,
    ctx.data?.email?.indexOf("@") || 0
  );
  return targ || Math.round(Math.random() * 1000000).toString(32);
}


export default AccountModel;
