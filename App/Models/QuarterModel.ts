import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ActivityModel from "./ActivityModel";
import BuildingModel from "./BuildingModel";
import ChannelModel from "./ChannelModel";

let QuarterSchema = SQuery.Schema({

    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    buildings: [{
        type: Schema.Types.ObjectId,
        ref: BuildingModel.modelName,
        alien: true,
    }],
    Thread: {
        type: Schema.Types.ObjectId,
        ref: ChannelModel.modelName,
        strictAlien : true
    },
    activities: [{
        type: Schema.Types.ObjectId,
        ref: ActivityModel.modelName,
    }]
});


const QuarterModel = mongoose.model("quarter", QuarterSchema);

MakeModelCtlForm({
    schema: QuarterSchema,
    model: QuarterModel,
    volatile: true,
});
export default QuarterModel;