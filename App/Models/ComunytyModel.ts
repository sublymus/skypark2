import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ActivityModel from "./ActivityModel";
let ComunytySchema = SQuery.Schema({
    name: {
        type: String,
    },
    activities: [{
        type: Schema.Types.ObjectId,
        ref: ActivityModel.modelName,
    }]
});

const ComunytyModel = mongoose.model('community', ComunytySchema)

MakeCtlForm({
    schema: ComunytySchema,
    model: ComunytyModel,
    volatile: true

})

export default ComunytyModel