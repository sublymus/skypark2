import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import FolderModel from "./FolderModel";

let favoritesSchema = new Schema({
  __key: {
    type: Schema.Types.ObjectId,
    require: true,
    access: 'secret'
  },
  folders: [{
    type: Schema.Types.ObjectId,
    ref: FolderModel.modelName,
    populate: true,
    watch:true,
    impact:true,
  }]
});

const FavoritesModel = mongoose.model("favorites", favoritesSchema);


const fCtl = MakeCtlForm({
  schema: favoritesSchema,
  model: FavoritesModel,
  modelPath: 'favorites',
  volatile: false,
});


/*

*/


//Log('log', favoritesSchema.obj)
export default FavoritesModel;
