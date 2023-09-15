import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import { LabelController } from "./LabelModel";

const SurveySchema = SQuery.Schema({
    options: [{
        type:Schema.Types.ObjectId,
        ref:LabelController.name,
        required:true,
    }],
    totalVotes: {
        type:Number,
        access:'admin',
        default:0,
    },
    delay:{
        type:Number,
        default:60*60*24,
        required:true,
    }
});

export const SurveyController = new SQuery.ModelController({
    name:'survey',
    schema: SurveySchema,
  });
  