import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ActivityModel from "./ActivityModel";
import BuildingModel from "./BuildingModel";
import SupervisorModel from "./SupervisorModel";

let QuarterSchema = SQuery.Schema({
    users: [{
        type: Schema.Types.ObjectId,
        ref: "user",
        alien: true,
        impact: false,
        access:'share',
        share:{
          only:['client:admin']
        }
      }],
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
    }],
    supervisors:[{
        type:Schema.Types.ObjectId,
        ref:SupervisorModel.modelName
    }],
    Thread: [{
        type: Schema.Types.ObjectId,
        ref: 'post',
        access: 'public',
        impact: true,
    }],
    activities: [{
        type: Schema.Types.ObjectId,
        ref: ActivityModel.modelName,
    }]
});


const QuarterModel = mongoose.model("quarter", QuarterSchema);

MakeModelCtlForm({
    schema: QuarterSchema,
    model: QuarterModel
});
export default QuarterModel;