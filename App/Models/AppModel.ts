import mongoose, { ObjectId, Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import EntrepiseModel from './EntrepriseModel';
import AdminModel from "./AdminModel";

let AppSchema = SQuery.Schema({
  entreprises: [{
    type: Schema.Types.ObjectId,
    ref: EntrepiseModel.modelName,
    impact:false,
    access:'share',
    share:{
      only:['client:admin']
    }
  }],
  admins:[{
    type:Schema.Types.ObjectId,
    ref:'admin',
    access:'share',
    share:{
      only:['client:admin']
    }
  }]
});

const AppModel = mongoose.model("app", AppSchema);

const maker = MakeModelCtlForm({
  schema: AppSchema,
  model: AppModel,
  volatile:true
});

maker.pre('create',async()=>{
    const app = await AppModel.findOne();
    if(app) {
      return {
        response:(app._id as ObjectId).toString(),
        code:'OPERATION_SUCCESS',
        message:'OPERATION_SUCCESS',
        status:200
      };
    }
}).post('create',async({more})=>{
  const admins = await AdminModel.find();
  admins.forEach(admin=>{
    admin.app = more?.modelId;
    more?.modelInstance?.admins?.push(admin._id);
    admin.save();
  })
  more?.modelInstance?.save();
})

export default AppModel;
