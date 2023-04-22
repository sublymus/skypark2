import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";


let folderSchema = SQuery.Schema({

  refIds: [{
    type: Schema.Types.ObjectId,
    impact:false,
  }],
  folderName: {
    type: String,
    required: true
  },

});

const FolderModel = mongoose.model("folder", folderSchema);

MakeModelCtlForm({
  schema: folderSchema,
  model: FolderModel,
  volatile: true,
});
export default FolderModel;
