import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AddressModel from "./AddressModel";
import BuildingModel from "./BuildingModel";
import ConstructionManagerModel from "./EntrepriseManagerModel";
import ProfileModel from "./ProfileModel";
import ManagerModel from "./ManagerModel";
import QuarterModel from "./QuarterModel";
import EntrepriseManagerModel from "./EntrepriseManagerModel";

let EntrepiseSchema = SQuery.Schema({
  managers: [{
    type: Schema.Types.ObjectId,
    //ref: ConstructionManagerModel.modelName,
    ref: ManagerModel.modelName,
    alien: true,
    impact:false,
  }],
  quarters: [{
    type: Schema.Types.ObjectId,
    ref: QuarterModel.modelName,
    strictAlien: true,
    impact:false,
  }],
  address: {
    type: Schema.Types.ObjectId,
    ref: AddressModel.modelName,
  },
  telephone: [{
    type: String,
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
    type: Number,
  },
});

const EntrepiseModel = mongoose.model("entreprise", EntrepiseSchema);

const ctrlMaker = MakeModelCtlForm({
  schema: EntrepiseSchema,
  model: EntrepiseModel,
  volatile: true,
});


export default EntrepiseModel;
