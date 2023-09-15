import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {AddressController} from "./AddressModel";
import {ProfileController} from "./ProfileModel";
import {ManagerController} from "./ManagerModel";
import {QuarterController} from "./QuarterModel";

let EntrepiseSchema = SQuery.Schema({
  managers: [{
    type: Schema.Types.ObjectId,
    ref: ManagerController.name,
    impact:false,
    access:'share',
    share:{
      only:['client:manager', 'client:admin']
    }
  }],
  quarters: [{
    type: Schema.Types.ObjectId,
    ref: QuarterController.name,
    impact:false,
    access:'share',
    share:{
      only:['client:manager', 'client:admin']
    }
  }],
  address: {
    type: Schema.Types.ObjectId,
    ref: AddressController.name,
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
    ref: ProfileController.name,
  },
  creationDate: {
    type: Number,
  },
});

export const EntrepriseController = new SQuery.ModelController({
  name:'entreprise',
  schema: EntrepiseSchema,
});