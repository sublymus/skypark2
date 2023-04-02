import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import FileListModel from "./FileListModel";

let MessageSchema = SQuery.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        strictAlien:true,
    },
    text: {
        type: String
    },
    fileList: [{
        type: Schema.Types.ObjectId,
        ref: FileListModel.modelName,
        //checkout:true,
    }],
    targets: {
        type: Schema.Types.ObjectId,
        ref: 'user',/////
    }
});

const MessageModel = mongoose.model("message", MessageSchema);

MakeModelCtlForm({
    schema: MessageSchema,
    model: MessageModel,
    volatile: true,
});

export default MessageModel;
