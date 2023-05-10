import mongoose, { Schema } from "mongoose";
import Log from "sublymus_logger";
import { Controllers, ModelControllers, Tools } from "../../lib/squery/Initialize";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AccountModel from "./AccountModel";
import MessengerModel from "./MessengerModel";

let userSchema = SQuery.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    //  required: true,
  },
  managerProperty:{
    type:String,
    share:{
      ony:['client:user'],
      add:[]
    },
    access:'share',
  },

  messenger: { 
    type: Schema.Types.ObjectId,
    ref: MessengerModel.modelName,
    access: 'private'
  }
});

 const UserModel = mongoose.model("user", userSchema);

const maker = MakeModelCtlForm({
  model: UserModel,
  schema: userSchema,
  volatile: true,
})

maker.tools.assigneToNewListElement({
  parentModelPath: 'building',
  parentListProperty: 'users',
  targetExtractorPath: './account/address',
  targetProperty: 'building',
  sourceExtractorPath: './',
  sourceProperty: '_id',
  map: (id, option) => {
    Log('soureceID', { id, option })
    return id
  }
});
maker.tools.assigneToNewListElement({
  parentModelPath: 'building',
  parentListProperty: 'users',
  targetExtractorPath: './account/address',
  targetProperty: 'quarter',
  sourceExtractorPath: '../',
  sourceProperty: '_id',
  map: (id, option) => {
    Log('soureceID', { id, option })
    return id
  }
});

export default UserModel;