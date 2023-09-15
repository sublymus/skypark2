import mongoose, { ObjectId, Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {EntrepriseController} from './EntrepriseModel';
import {AdminController} from "./AdminModel";

let AppSchema = SQuery.Schema({
  entreprises: [{
    type: Schema.Types.ObjectId,
    ref: EntrepriseController.name,
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

export const AppController = new SQuery.ModelController({
  name:'app',
  schema: AppSchema,
});

AppController.pre('create',async()=>{
    const app = await AppController.model.findOne();
    if(app) {
      return {
        response:app._id.toString(),
        code:'OPERATION_SUCCESS',
        message:'OPERATION_SUCCESS',
        status:200
      };
    }
}).post('create',async({more})=>{
  const admins = await AdminController.model.find();
  admins.forEach((admin:any)=>{
    admin.app = more?.modelId;
    more?.modelInstance?.admins?.push(admin._id);
    admin.save();
  })
  more?.modelInstance?.save();
})

export default AppController;
