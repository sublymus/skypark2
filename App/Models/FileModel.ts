import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let fileSchema = SQuery.Schema({

  url:{
    type:String,
    required:true,
  },
  typeMIME:{
    type:String,
  },
  size:{
    type:String,
  },

});

const FileModel = mongoose.model("file", fileSchema);

MakeCtlForm({
  schema: fileSchema,
  model: FileModel,
  volatile: true,
});
export default FileModel;
