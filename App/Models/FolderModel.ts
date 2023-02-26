import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
//@ts-ignore

let folderSchema = SQuery.Schema({
  __key: {
    type: Schema.Types.ObjectId,
    required: true,
    access: 'secret'
  },
  refIds: [{
      type: Schema.Types.ObjectId,
    }],
  folderName: {
    type: String,
    required: true
  },
  createdDate:{
    type:Number,
  }
});

const FolderModel = mongoose.model("folder", folderSchema);

MakeCtlForm({
  schema: folderSchema,
  model: FolderModel,
  modelPath: 'folder',
  volatile:true,
});
export default FolderModel;
