import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import FolderModel from "./FolderModel";
import RefIdModel from "./RefId";

let favoritesSchema = SQuery.Schema({

  folders: [{
    type: Schema.Types.ObjectId,
    ref: FolderModel.modelName,
    //impact: true,
  }],
  likeList: {
    type: Schema.Types.ObjectId,
    ref: RefIdModel.modelName,
  }

});
const FavoritesModel = mongoose.model("favorites", favoritesSchema);

MakeCtlForm({
  schema: favoritesSchema,
  model: FavoritesModel,
  volatile: false,
});

export default FavoritesModel;
