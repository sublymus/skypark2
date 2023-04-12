import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ChannelModel from "./ChannelModel";

let MessengerSchema = SQuery.Schema({
    discussions: [{
        type: Schema.Types.ObjectId,
        ref: ChannelModel.modelName,
    }],
    archives:[{
        type:Schema.Types.ObjectId,
        ref:ChannelModel.modelName,
    }],
});

const MessengerModel = mongoose.model("messenger", MessengerSchema);

MakeModelCtlForm({
    schema: MessengerSchema,
    model: MessengerModel,
    volatile: true,
});

export default MessengerModel;
