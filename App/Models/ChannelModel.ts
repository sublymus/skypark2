import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import WatcherModel from "./WatcherModel";

let ChannelSchema = SQuery.Schema({
    name: {
        type: String,
        trim: true,
        minlength: [3, "trop court"],
        maxlength: [20, "trop long"],
        required: true,
        access: 'public',
    },
    firstWatcher: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        strictAlien: true,
        access: 'public',
    },
    description: {
        type: String,
        trim: true,
        maxlength: [512, "trop long"],
        access: 'public',
    },
    vectors: [{
        type: Schema.Types.ObjectId,
        ref: 'post',
        access: 'public',
    }],
    watcher: [{
        type: Schema.Types.ObjectId,
        ref: WatcherModel.modelName,
        access: 'public',
    }]
});

const ChannelModel = mongoose.model("channel", ChannelSchema);

const ctrlMaker = MakeModelCtlForm({
    schema: ChannelSchema,
    model: ChannelModel,
    volatile: false,
});

ctrlMaker.pre('read', async (e) => {

})
ctrlMaker.post('read', async (e) => {

})

export default ChannelModel;
