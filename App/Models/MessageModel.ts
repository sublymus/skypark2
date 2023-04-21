import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import FileListModel from "./FileListModel";
import FileModel from "./FileModel";

let MessageSchema = SQuery.Schema({
    //*NEW_ADD
    account: {
        type: Schema.Types.ObjectId,
        ref: 'account',
        strictAlien:true,
        impact:false,
    },
    text: {
        type: String
    },
    file: {
        type: Schema.Types.ObjectId,
        ref: FileModel.modelName,
        //checkout:true,
    },
    targets: [{
        type: Schema.Types.ObjectId,
        ref: 'user',/////
        impact:false,
    }]
});

const MessageModel = mongoose.model("message", MessageSchema);

MakeModelCtlForm({
    schema: MessageSchema,
    model: MessageModel,
    volatile: true,
});

export default MessageModel;
