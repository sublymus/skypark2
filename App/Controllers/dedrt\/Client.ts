import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { SaveCtrl } from "../../lib/squery/CtrlManager";
import { ControllerSchema, Controllers, ModelControllers, ModelInstanceSchema, ResponseSchema } from "../../lib/squery/Initialize";
import { AuthDataMap, SQuery } from "../../lib/squery/SQuery";
import { AuthManager } from "../../lib/squery/AuthManager";

const Client: ControllerSchema = {
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
        const res = await authCtrl.login({
            ...ctx,
            action: 'read',
            ctrlName: 'login',
            authData: AuthDataMap['user'],
            data: {
                email: ctx.data.email,
                password: ctx.data.code,
                __permission: 'user:user'
            }
        });
        Log("****", res);
        return res;
    }
}


const ctrlMaker = SaveCtrl({
    ctrl: { Client },
    access: {
        like: "any"
    }
})

ctrlMaker.pre('comments', async ({ ctx }) => {
    ctx.post = {
        comments: {
            __permission: 'admin'
        }
    }
})
ctrlMaker.post('like', async (e) => { })
