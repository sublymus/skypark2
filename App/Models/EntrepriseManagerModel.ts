import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AccountModel from "./AccountModel";
//import EntrepiseModel from "./EntrepiseModel";

let EntrepriseManagerSchema = SQuery.Schema({

    account: {
        type: Schema.Types.ObjectId,
        ref: AccountModel.modelName,
        //  required: true,
    },
    entreprise: {
        type: Schema.Types.ObjectId,
        ref: 'entreprise',
        strictAlien: true,
    }
});

const EntrepriseManagerModel = mongoose.model("entreprisemanager", EntrepriseManagerSchema);

const ctrlMaker = MakeModelCtlForm({
    schema: EntrepriseManagerSchema,
    model: EntrepriseManagerModel,
    volatile: true,
});

ctrlMaker.pre('store', async ({ ctx }) => {
   
})


export default EntrepriseManagerModel;
