import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
//@ts-ignore


let folderSchema = new Schema({
  __key: {
    type: Schema.Types.ObjectId,
    require: true,
    access: 'secret'
  },
  refIds: {
    type: Object,
  },
  folderName: {
    type: String,
    required: true
  },
  createdDate: Number
});

const FolderModel = mongoose.model("folder", folderSchema);

MakeCtlForm({
  schema: folderSchema,
  model: FolderModel,
  modelPath: 'folder',
  volatile:true,
});
export default FolderModel;
