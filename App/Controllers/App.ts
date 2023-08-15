import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { CtrlManager } from "../../lib/squery/CtrlManager";
import { ControllerSchema, Controllers, ModelControllers, ModelInstanceSchema, ResponseSchema } from "../../lib/squery/Initialize";
import {SQuery } from "../../lib/squery/SQuery";
import PadiezdModel from "../Models/PadiezdModel";
import QuarterModel from "../Models/QuarterModel";
import BuildingModel from "../Models/BuildingModel";
import UserModel from "../Models/UserModel";
const app: ControllerSchema = {
    buildingList:async (ctx: ContextSchema): ResponseSchema => {
        Log('padiezdList',ctx.data);
        const quarter = await QuarterModel.findOne({_id:ctx.data.quarterId});
        Log('quarter',{quarter});
        if(!quarter) return
        
        const buildingList = await BuildingModel.find({
            _id:{
                $in:quarter.buildings.map((b:any)=>b._id.toString()),
            }
        })
        
        Log('buildingList' , {buildingList})

        return{
            response:buildingList,
            code:'ok',
            message:'ok',
            status:200,
        }
    },
    padiezdList: async (ctx: ContextSchema): ResponseSchema => {
        Log('padiezdList',ctx.data);
        const quarter = await QuarterModel.findOne({_id:ctx.data.quarterId});
        Log('quarter',{quarter});
        if(!quarter) return
        
        const filter = quarter.buildings.map((b:any) => {
            return 'building_'+b._id.toString()+"_padiezdList_padiezd"
        });
        Log('filter',{filter});
        const padiezdList = await PadiezdModel.find({
            __parentModel:{
                $in:filter
            }

        })
        
        Log('padiezdList' , {padiezdList})

        return {
            response:padiezdList,
            code:'ok',
            message:'ok',
            status:200,
        }
    },
    userList: async (ctx: ContextSchema): ResponseSchema => {
        Log('userList',ctx.data);
        const {quarterId , ids, filter:f, sort} = ctx.data as {quarterId: string , ids:string[], filter:'Padiezd' | 'Building', sort:{}}
        if(!quarterId) return;

        let filter:string[] = [];
        let padiezdIds :string[] = [];
        if(f=='Building'){
            for (const id of ids) {
                const building =  await BuildingModel.findOne({_id:id}).sort(sort||{}).allowDiskUse(true);
                if(!building) continue; 
                padiezdIds = [...padiezdIds ,...building.padiezdList.map((p:any) => p._id.toString() )] ;
            }
        }else{
            padiezdIds = ids;
        }
        Log('padiezdIds',{padiezdIds});
        filter = padiezdIds.map((id:string) => {
            return 'padiezd_'+id+"_users_user"
        });
        Log('filter',{filter});
        const userList = await UserModel.find({
            __parentModel:{
                $in:filter
            }

        }).populate({
            path:'account',
            select:'_id name userTarg status email telephone address profile ',
            populate:[{
                path:'address',
                select:'_id localisation quarter building padiezd city status etage description room ',
            },{
                path:'profile',
                select:'_id imgProfile banner message',
            }]
        })
        
        
        Log('padiezdList' , {userList})

        return {
            response:userList,
            code:'ok',
            message:'ok',
            status:200,
        }
    },
}

const maker = CtrlManager({
    ctrl: { app },
    access: {
        like: "any"
    }
});