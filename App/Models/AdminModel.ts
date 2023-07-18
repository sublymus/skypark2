import mongoose, { ObjectId, Schema } from "mongoose";
import { SQueryMongooseSchema } from "../../lib/squery/Initialize";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import UserModel from "./UserModel";
import AppModel from "./AppModel";
import Log from "sublymus_logger";

const AdminSchema = SQuery.Schema({
    app:{
        type:  Schema.Types.ObjectId,
        ref:AppModel.modelName,
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
export const AdminModel = mongoose.model("admin", AdminSchema);

const maker = MakeModelCtlForm({
    model: AdminModel,
    schema: AdminSchema,
    volatile: true,
});
maker.pre('create',async({ctx,more})=>{
    ctx.data.key = new mongoose.Types.ObjectId().toString();
    const app = await AppModel.findOne();
    if(app){
        ctx.data.app = (app?._id as mongoose.Types.ObjectId)?.toString();
        app.admins.push(more?.modelId);
        app.save();
    }
})

export default AdminModel;
