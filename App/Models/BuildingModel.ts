import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
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
    community:{
        type:Schema.Types.ObjectId,
        ref:ComunytyModel.modelName,
    },
    updatedDate: {
        type: Number,
    }
});


const BuildingModel = mongoose.model("building", buildingSchema);

MakeCtlForm({
    schema: buildingSchema,
    model: BuildingModel,
    volatile: false,
});
export default BuildingModel;
