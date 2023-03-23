import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let WatcherSchema = SQuery.Schema({
    modelId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    // access:[{
    //     type:String,

    // }]
});

const WatcherModel = mongoose.model("watcher", WatcherSchema);

MakeModelCtlForm({
    schema: WatcherSchema,
    model: WatcherModel,
    volatile: false,
});

export default WatcherModel;
