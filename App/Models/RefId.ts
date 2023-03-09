import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
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

MakeCtlForm({
    schema: refIdSchema,
    model: RefIdModel,
    volatile: false,
});

export default RefIdModel;
