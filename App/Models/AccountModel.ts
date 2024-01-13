import mongoose, { Schema } from "mongoose";
import { ContextSchema } from "../../lib/squery/Context";
import { SQuery } from "../../lib/squery/SQuery";
import {AddressController} from "./AddressModel";
import {FavoritesController} from "./FavoritesModel";
import {ProfileController} from "./ProfileModel";
import { HistoriqueController  } from "./Historique";

let accountSchema = SQuery.Schema({
  name: {
    type: String,
    trim: true,
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
    //unique: true,
  },
  status: {
    type: String,// proprietaire, locataire, superviseur , manageur
  },
  password: {
    type: String,
    required: true,
    access: "private",
  },
  telephone: {
    type: String,
    required: true,
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: AddressController.name,
  },
  favorites: {
    type:Schema.Types.ObjectId,
    ref: FavoritesController.name,
    access: "private",
    default:{
      folders: [],
      likeList: []
    }
  },
  historique:{
    type:Schema.Types.ObjectId,
    ref: HistoriqueController.name,
    access: "private",
    default:{
      folders: [],
      likeList: []
    }
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: ProfileController.name,
    default:{
      imgProfile: [],
      banner: [],
    }
  },
});

export const AccountController = new SQuery.ModelController({
  name:'account',
  schema: accountSchema,
});


AccountController.pre("create", async function youyou ({ ctx })  {
  const userTarg = getTarg(ctx);
  const account = await AccountController.model.findOne({
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
