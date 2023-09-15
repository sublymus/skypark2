import { ContextSchema } from "../../lib/squery/Context";
import {  ResponseSchema } from "../../lib/squery/Initialize";
import {QuarterController} from "../Models/QuarterModel";
import { AuthManager } from "../../lib/squery/AuthManager";
import { AuthDataMap } from "../../lib/squery/SQuery_auth";
import { SQuery } from "../../lib/squery/SQuery";
import { ACCESS_BREAKER } from "../Tools/Breaker";
import { Local } from "../../lib/squery/SQuery_init";


export const ClientController = new SQuery.Controller({
    name:'client',
    services: {
        create: async (ctx: ContextSchema): ResponseSchema => {
            try {
                const { entrepriseId, name,
                    email,
                    telephone,
                    room,
                    etage,
                    lastName,
                    padiezd,
                    status,
                    quarterId } = ctx.data;
                    console.log('wertyui');
                    
                    if (ACCESS_BREAKER(ctx, ['manager', 'admin'])) return
                    const quartier = await QuarterController.model.findOne({_id:quarterId});
                if(!quartier) return
    
    
                const token = await SQuery.Cookies(ctx.socket, 'token');
                const res = await Local.ModelControllers['user']?.services['list']?.({
                    ...ctx,
                    __permission: 'admin',
                    data: {
                        addNew: [{
                            "account": {
                                "name": name +' '+ lastName,
                                "email": email,
                                "status": status,
                                "password": "code",
                                "telephone": telephone,
                                "address": {
                                    "room": room,
                                    "city": quartier.name,
                                    "padiezd": padiezd,
                                    "etage": etage,
                                    "description": "rigth"
                                }
                            }
                        }],
                        paging: {
                            query: {
                                __parentModel: "padiezd_" +padiezd + "_users_user"
                            }
                        }
                    }
                });
                console.log('###',res);
                
                if (!res?.response) return res;
        
                await SQuery.Cookies(ctx.socket, 'token', token);
                return res;
            } catch (error) {
                return
            }
        },
        firstConnect: async (ctx: ContextSchema): ResponseSchema => {
            const authCtrl = new AuthManager();
            const { email, code, password1, password2 } = ctx.data;
    
            let error = "";
            if (!email) error += "<email>, ";
            if (!code) error += "<code>, ";
            if (!password1) error += "<password1>, ";
            if (!password2) error += "<password2>, ";
            if (error) error += " are missing.  "
            if (password1 !== password2) error += "<password1> != <password2>";
            if (error) return {
                error: "OPERATION_FAILED",
                code: "OPERATION_FAILED",
                message: error,
                status: 404
            }
            // const account = await Models[ctx.login.modelPath].findOne({ email, password: code })
    
            // if (!account) return {
            //     error: "NOT_FOUND",
            //     code: "NOT_FOUND",
            //     message: "Account don't exist",
            //     status: 404,
            // }
    
            const LogRes = await authCtrl.login({
                ...ctx,
                service: 'read',
                ctrlName: 'login',
                authData: AuthDataMap['user'],
                data: {
                    email: email,
                    password: code,
                    // __permission: account.__permission,
                }
            });
            if (!LogRes?.response) return LogRes;
            const res = await Local.ModelControllers[LogRes.response.login.modelPath]?.services['update']?.({
                ...ctx,
                // __key: account.__key,
                // __permission: account.__permission,
                data: {
                    id: LogRes.response.login.id,
                    password: password1,
                }
            });
            if (!res?.response) return res;
    
            return res;
        }
    }
});
