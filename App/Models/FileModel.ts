import mongoose from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let fileSchema = SQuery.Schema({

  url: [{
    type: String,
    required: true,
    file:{}
  }],


});

const FileModel = mongoose.model("file", fileSchema);

MakeModelCtlForm({
  schema: fileSchema,
  model: FileModel,
  volatile: true,
});
export default FileModel;
