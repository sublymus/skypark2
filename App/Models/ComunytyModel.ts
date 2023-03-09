import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import FolderModel from "./FolderModel";
import MagasinModel from "./Magasin";

let ComunytySchema = SQuery.Schema({
  
});

const ComunytyModel = mongoose.model('community', ComunytySchema)

MakeCtlForm({
  schema: ComunytySchema,
  model: ComunytyModel,
  volatile: true

})

export default ComunytyModel