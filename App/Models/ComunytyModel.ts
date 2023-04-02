import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ActivityModel from "./ActivityModel";
let ComunytySchema = SQuery.Schema({
    name: {
        type: String,
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      strictAlien: true,
    }],
    activities: [{
        type: Schema.Types.ObjectId,
        ref: ActivityModel.modelName,
    }]
});

const ComunytyModel = mongoose.model('community', ComunytySchema)

MakeModelCtlForm({
    schema: ComunytySchema,
    model: ComunytyModel,
    volatile: true
})

export default ComunytyModel