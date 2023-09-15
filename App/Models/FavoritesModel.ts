import mongoose, { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {FolderController} from "./FolderModel";

let favoritesSchema = SQuery.Schema({

  folders: [{
    type: Schema.Types.ObjectId,
    ref: FolderController.name,
    impact: true,
  }]
});

export const FavoritesController = new SQuery.ModelController({
  name:'favorites',
  schema: favoritesSchema,
});
