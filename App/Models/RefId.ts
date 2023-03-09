import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let favoritesSchema = SQuery.Schema({
    refId: [{
        type: Schema.Types.ObjectId
    }],
    model: {
        type: String,
    }
});
const RefIdModel = mongoose.model("refid", favoritesSchema);

MakeCtlForm({
    schema: favoritesSchema,
    model: RefIdModel,
    volatile: false,
});

export default RefIdModel;
