import mongoose, { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {ActivityController} from "./ActivityModel";
import {BuildingController} from "./BuildingModel";
import {SupervisorController} from "./SupervisorModel";

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
        ref: BuildingController.name,
    }],
    supervisors:[{
        type:Schema.Types.ObjectId,
        ref:SupervisorController.name
    }],
    Thread: [{
        type: Schema.Types.ObjectId,
        ref: 'post',
        access: 'public',
        impact: true,
    }],
    supervisorThread: [{
        type: Schema.Types.ObjectId,
        ref: 'post',
        access: 'public'
    }],
    activities: [{
        type: Schema.Types.ObjectId,
        ref: ActivityController.name,
    }]
});

export const QuarterController = new SQuery.ModelController({
    name:'quarter' ,
    schema: QuarterSchema
  });