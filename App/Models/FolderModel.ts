import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";


let folderSchema = SQuery.Schema({

  refIds: [{
    type: Schema.Types.ObjectId,
  }],
  folderName: {
    type: String,
    required: true
  },

});

const FolderModel = mongoose.model("folder", folderSchema);

MakeCtlForm({
  schema: folderSchema,
  model: FolderModel,
  volatile: true,
});
export default FolderModel;
