import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AddressModel from "./AddressModel";
import BuildingModel from "./BuildingModel";
import ConstructionManagerModel from "./EntrepriseManagerModel";
import ProfileModel from "./ProfileModel";
import ManagerModel from "./ManagerModel";

let EntrepiseSchema = SQuery.Schema({
  managers: [{
    type: Schema.Types.ObjectId,
    //ref: ConstructionManagerModel.modelName,
    ref: ManagerModel.modelName,
    strictAlien: true,
  }],
  buildings: [{
    type: Schema.Types.ObjectId,
    ref: BuildingModel.modelName,
    alien: true,
  }],
  address: {
    type: Schema.Types.ObjectId,
    ref: AddressModel.modelName,
  },
  telephone: [{
    type: Number,
  }],
  email: {
    type: String,
  },
  webPageUrl: {
    type: String,
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: ProfileModel.modelName,
  },
  creationDate: {
    type: Date,
  },
});

const EntrepiseModel = mongoose.model("entreprise", EntrepiseSchema);

const ctrlMaker = MakeModelCtlForm({
  schema: EntrepiseSchema,
  model: EntrepiseModel,
  volatile: true,
});

ctrlMaker.pre('store', async ({ ctx }) => {

})


export default EntrepiseModel;
