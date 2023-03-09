import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import FileListModel from "./FileListModel";
//import UserModel from "./UserModel";

let MessageSchema = SQuery.Schema({
    user: {
        type: Schema.Types.ObjectId,
        //ref: UserModel.modelName,
    },
    text: {
        type: String
    },
    fileList: [{
        type: Schema.Types.ObjectId,
        ref: FileListModel.modelName,
        //checkout:true,
    }],
    __fileList:{
        type:String,
        maxlength:10,
        minlength:10,
    },
    targets: {
        type: Schema.Types.ObjectId,
       // ref: UserModel.modelName,
    }
});

const MessageModel = mongoose.model("message", MessageSchema);

MakeCtlForm({
    schema: MessageSchema,
    model: MessageModel,
    volatile: true,
});
export default MessageModel;
