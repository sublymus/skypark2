import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import CommunityModel from "./CommunityModel";
import BuildingModel from "./BuildingModel";

let QuarterSchema = SQuery.Schema({

    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    buildings: [
        {
          type: Schema.Types.ObjectId,
          ref: BuildingModel.modelName,
          strictAlien: true,
        },
      ],
    community: {
        type: Schema.Types.ObjectId,
        ref: CommunityModel.modelName,
    },

});


const QuarterModel = mongoose.model("quarter", QuarterSchema);

MakeModelCtlForm({
    schema: QuarterSchema,
    model: QuarterModel,
    volatile: true,
});
export default QuarterModel;
