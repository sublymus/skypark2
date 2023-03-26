import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ComunytyModel from "./ComunytyModel";

let buildingSchema = SQuery.Schema({

    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    community: {
        type: Schema.Types.ObjectId,
        ref: ComunytyModel.modelName,
    },

});


const BuildingModel = mongoose.model("building", buildingSchema);

MakeModelCtlForm({
    schema: buildingSchema,
    model: BuildingModel,
    volatile: true,
});
export default BuildingModel;
