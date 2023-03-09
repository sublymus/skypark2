import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import FolderModel from "./FolderModel";

let favoritesSchema = SQuery.Schema({
  __key: {
    type: Schema.Types.ObjectId,
    required: true,
    access: 'secret'
  },
  folders: [{
    type: Schema.Types.ObjectId,
    ref: FolderModel.modelName,
    //populate: true,
    //watch: true,
    //impact: true,
  }],
  updatedDate: {
    type: Number,
  },
});
const FavoritesModel = mongoose.model("favorites", favoritesSchema);
//console.log(favoritesSchema);

const fCtl = MakeCtlForm({
  schema: favoritesSchema,
  model: FavoritesModel,
  volatile: false,
});


/*

*/


//Log('log', favoritesSchema.obj)
export default FavoritesModel;
