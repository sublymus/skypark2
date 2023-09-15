import  mongoose, { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {AppController} from "./AppModel";

const AdminSchema = SQuery.Schema({
    app:{
        type:  Schema.Types.ObjectId,
        ref:'app',
        access:'admin',
    },
    email: {
        type: String,
        required: true,
        unique:true,
    },
    password: {
        type: String,
        required: true,
        access:'private'
    },
    key: {
        type:  Schema.Types.ObjectId,
        required: true,
        access:'private',
    },
    
});

export const AdminController = new SQuery.ModelController({
  name:'admin',
  schema: AdminSchema,
});

AdminController.pre('create',async({ctx})=>{
ctx.data = {
    ...ctx.data,
    key:new mongoose.Types.ObjectId().toString()
}
})