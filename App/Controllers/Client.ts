import { ContextSchema } from "../../lib/squery/Context";
import { CtrlManager } from "../../lib/squery/CtrlManager";
import { ControllerSchema, Controllers, ModelControllers, ModelInstanceSchema, ResponseSchema } from "../../lib/squery/Initialize";
import { AuthDataMap, SQuery } from "../../lib/squery/SQuery";
import { AuthManager } from "../../lib/squery/AuthManager";
const client: ControllerSchema = {
    create: async (ctx: ContextSchema): ResponseSchema => {
        const token = await SQuery.cookies(ctx.socket, 'token');
        const res = await ModelControllers['user']()['create']({
            ...ctx,
        });
        if (res.error) return res;
        await SQuery.cookies(ctx.socket, 'token', token);
        return res;
    },
    firstConnect: async (ctx: ContextSchema): ResponseSchema => {
        const authCtrl = new AuthManager();
        const {email , code , password1, password2 } = ctx.data;

        let error = "";
        if(!email) error += "<email>, ";
        if(!code) error += "<code>, ";
        if(!password1) error += "<password1>, ";
        if(!password2) error += "<password2>, ";
        if(error) error+=" are missing.  "
        if(password1 !== password2) error += "<password1> != <password2>";
        if(error) return  {
            error: "OPERATION_FAILED",
            code: "OPERATION_FAILED",
            message: error,
            status: 404
        }
        const account =  await  ModelControllers[ctx.login.modelPath].option.model.findOne({email,password:code})
        
        if(!account) return  {
            error: "NOT_FOUND",
            code: "NOT_FOUND",
            message: "Account don't exist",
            status: 404,
        }

        const LogRes = await authCtrl.login({
            ...ctx,
            service: 'read',
            ctrlName: 'login',
            authData: AuthDataMap['user'],
            data: {
                email: email,
                password: code,
                __permission: account.__permission,
            }
        });
        if(LogRes.error) return LogRes;
        const res = await ModelControllers[LogRes.response.login.modelPath]()['update']({
            ...ctx,
            __key:account.__key,
            __permission : account.__permission,
            data:{
                id:LogRes.response.login.id,
                password: password1,
            }
        });
        if(res.error) return res;
        
        return res;
    }
}

const maker = CtrlManager({
    ctrl: { client },
    access: {
        like: "any"
    }
});

  