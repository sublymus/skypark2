import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
//@ts-ignore

let fileSchema = SQuery.Schema({

  refIds: [{
    type: Schema.Types.ObjectId,
  }],
  folderName: {
    type: String,
    required: true
  },
  createdDate: {
    type: Number,
  },
  updatedDate: {
    type: Number,
  },
});

const FileModel = mongoose.model("file", fileSchema);

MakeCtlForm({
  schema: fileSchema,
  model: FileModel,
  volatile: true,
});
export default FileModel;
