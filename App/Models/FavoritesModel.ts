import mongoose, { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {FolderController} from "./FolderModel";


let favoritesSchema = SQuery.Schema({
  elements:[{
    type:{
      id:String,
      modelName:String
    }
  }]
});

export const FavoritesController = new SQuery.ModelController({
  name:'favorites',
  schema: favoritesSchema,
});

