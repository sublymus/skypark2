import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AddressModel from "./AddressModel";
import BuildingModel from "./BuildingModel";
import ConstructionManagerModel from "./SupervisorModel";
import ProfileModel from "./ProfileModel";
import ManagerModel from "./ManagerModel";
import QuarterModel from "./QuarterModel";
import EntrepriseManagerModel from "./SupervisorModel";

let EntrepiseSchema = SQuery.Schema({
  managers: [{
    type: Schema.Types.ObjectId,
    //ref: ConstructionManagerModel.modelName,
    ref: ManagerModel.modelName,
    impact:false,
    access:'share',
    share:{
      only:['client:manager', 'client:admin']
    }
  }],
  quarters: [{
    type: Schema.Types.ObjectId,
    ref: QuarterModel.modelName,
    impact:false,
    access:'share',
    share:{
      only:['client:manager', 'client:admin']
    }
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
  name:{
    type:String,
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
});


export default EntrepiseModel;
