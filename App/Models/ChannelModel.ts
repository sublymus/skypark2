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
        impact:true,
    }],
    watcher:[{
        type: Schema.Types.ObjectId,
        ref: WatcherModel.modelName,
        impact:true,
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
    /*
    TODO: pre:create 
    TODO: read:create 
    TODO: delete:create 
    TODO: update:create 
    TODO: access- droit
    */
})
ctrlMaker.post('read', async (e) => {

})

export default ChannelModel;
