import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import FolderModel from "./FolderModel";

let favoritesSchema = SQuery.Schema({

  folders: [{
    type: Schema.Types.ObjectId,
    ref: FolderModel.modelName,
    //impact: true,
    //access: "public",
    //: true,
  }],
  likeList: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
  }]

});
const FavoritesModel = mongoose.model("favorites", favoritesSchema);

MakeModelCtlForm({
  schema: favoritesSchema,
  model: FavoritesModel,
  volatile: false,
});

export default FavoritesModel;
