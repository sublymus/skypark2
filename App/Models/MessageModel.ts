import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let MessageSchema = SQuery.Schema({
    
});

const MessageModel = mongoose.model("message", MessageSchema);

MakeCtlForm({
    schema: MessageSchema,
    model: MessageModel,
    volatile: true,
});
export default MessageModel;
