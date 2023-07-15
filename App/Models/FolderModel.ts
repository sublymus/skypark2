import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import { ModelControllers } from "../../lib/squery/Initialize";


let folderSchema = SQuery.Schema({

  refIds: [{
    type:{
      modelPath:String,
      id:String
    },
  }],
  folderName: {
    type: String,
    required: true,
  },

});

const FolderModel = mongoose.model("folder", folderSchema);

MakeModelCtlForm({
  schema: folderSchema,
  model: FolderModel,
  volatile: true,
})
export default FolderModel;
