import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let refIdSchema = SQuery.Schema({
    refId: [{
        type: Schema.Types.ObjectId
    }],
    modelPath: {
        type: String,
    }
});
const RefIdModel = mongoose.model("refid", refIdSchema);

MakeModelCtlForm({
    schema: refIdSchema,
    model: RefIdModel,
    volatile: false,
});

export default RefIdModel;
