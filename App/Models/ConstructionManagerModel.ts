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
        ref: 'entrepise',
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
    //console.log('********************#################################*********', ctx.data);

    ctx.data = {
        ...ctx.data,
        profile: {
            /// imgProfile: ['/temp/1677915905612_6402f701d7944fff36120416.png'],
            // banner: ['/temp/1677915905612_6402f701d7944fff36120416.png'],
            message: "*** BEST ****",
        },
    }
})


export default EntrepriseManagerModel;
