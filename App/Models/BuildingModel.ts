import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let buildingSchema = SQuery.Schema({
    __key: {
        type: Schema.Types.ObjectId,
        required: true,
        access: 'secret'
    },
    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    updatedDate: {
        type: Number,
    }
});


const BuildingModel = mongoose.model("building", buildingSchema);

MakeCtlForm({
    schema: buildingSchema,
    model: BuildingModel,
    modelPath: 'building',
    volatile: false,
});
export default BuildingModel;
