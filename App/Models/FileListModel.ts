import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import FileModel from "./FileModel";

let FileListSchema = SQuery.Schema({
    files: [{
        type: Schema.Types.ObjectId,
        ref: FileModel.modelName,
        required:true,
    }],
    fileType : {
        type:String,
        required:true,
    },
    description:{
        type:String
    }
});

const FileListModel = mongoose.model("filelist", FileListSchema);

MakeCtlForm({
    schema: FileListSchema,
    model: FileListModel,
    volatile: true,
});
export default FileListModel;
