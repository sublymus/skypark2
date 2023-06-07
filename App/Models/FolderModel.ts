import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import { ModelControllers } from "../../lib/squery/Initialize";


let folderSchema = SQuery.Schema({

  refIds: [{
    type: Schema.Types.ObjectId,// __parentModel: 'user_64438c3a5f4ed54dc6cef9e7_account_account'
    alien: true,
    ref: 'refid',
  }],
  folderName: {
    type: String,
    required: true,
    emit: false
  },

});

const FolderModel = mongoose.model("folder", folderSchema);

MakeModelCtlForm({
  schema: folderSchema,
  model: FolderModel,
  volatile: true,
})
export default FolderModel;
