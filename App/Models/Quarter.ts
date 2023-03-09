import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ComunytyModel from "./ComunytyModel";

let QuarterSchema = SQuery.Schema({

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
    
});


const QuarterModel = mongoose.model("quarter", QuarterSchema);

MakeCtlForm({
    schema: QuarterSchema,
    model: QuarterModel,
    volatile: false,
});
export default QuarterModel;
