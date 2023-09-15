import Log from "sublymus_logger";
import { ContextSchema } from "./Context";
import { ControllerInfoInterface, ControllerInterface, EventPostSchema, EventPreSchema, ListenerPostSchema, ListenerPreSchema, MoreSchema, ResponseSchema, ResultSchema,  ServiceListInterface, servicesDescriptionInterface } from "./Initialize";
import { UNDIFINED_RESULT } from "./ModelCtrlManager";
/*88888888888888888888

NB:  les nom de model sont en lowercase : my_controller is well

8888888888888888888*/

export class Controller <NAME extends string = string , SERVICES extends ServiceListInterface =ServiceListInterface , SERVICES_DESCRIPTION extends servicesDescriptionInterface= servicesDescriptionInterface > implements ControllerInterface<SERVICES_DESCRIPTION,NAME,SERVICES> {
    #EventManager: {
        [p: string]: {
            pre: ListenerPreSchema[];
            post: ListenerPostSchema[];
        };
    } = {};
    
    name = '' as NAME;
    servicesDescription = {} as SERVICES_DESCRIPTION| undefined ;
    services = {} as SERVICES;
    constructor(info: ControllerInfoInterface<SERVICES_DESCRIPTION,NAME ,SERVICES> ){
        let serviceList: ServiceListInterface;
        this.name = info.name;
        const observableServiceList: ServiceListInterface = {};
        serviceList = info.services;
        for (const service in serviceList) {
            if (Object.prototype.hasOwnProperty.call(serviceList, service)) {
                observableServiceList[service] = async (ctx: ContextSchema, more?: MoreSchema): ResponseSchema => {
                    const preRes = await this.#callPre({
                        ctx,
                        more,
                    });
                    if (preRes) return preRes
                    let rest :ResultSchema|void|undefined;
                    try {
                        rest = await serviceList[service](ctx, more) ;
                    } catch (error:any) {
                        

                        try {
                            const res = JSON.parse(error.message);
                            if((res.error||res.response)&&res.status ){
                                rest = {...res, status: parseInt(res.status.split(':')[0]) , code:res.status.split(':')[1] };
                                //@ts-ignore
                                delete rest?.debug
                                Log("@@@@@@@@@@@@",rest);
                            }
                        } catch (error) {
                            
                        }
                    }
                    return await this.#callPost({
                        ctx,
                        res:rest||UNDIFINED_RESULT ,
                        more
                    });
                };
            }
        }
        this.services = observableServiceList as SERVICES;
        this.servicesDescription = info.servicesDescription
    }
    #callPre: (e: EventPreSchema) => Promise<void | ResultSchema> = async (e: EventPreSchema) => {
        try {

            if (!(this.#EventManager[e.ctx.service]?.pre)) return

            for (const listener of this.#EventManager[e.ctx.service].pre) {

                if (listener) return await listener(e);
            }
        } catch (error) {
            Log('ERROR_Ctrl_callPre', error);
        }
    }
    #callPost: (e: EventPostSchema) => ResponseSchema = async (
        e: EventPostSchema
    ) => {
        try {
            if (!this.#EventManager[e.ctx.service]?.post) return e.res;
            for (const listener of this.#EventManager[e.ctx.service].post) {
                if (listener) {
                    const r = await listener(e);
                    if (r) return r;
                }
            }
            return e.res;
        } catch (error) {
            Log("ERROR_callPost", error);
        }
        return e.res;
    }
    pre(service: keyof SERVICES, listener: ListenerPreSchema) {
        if (!this.#EventManager[service as string]) {
            this.#EventManager[service as string] = {
                pre: [],
                post: [],
            };
        }
        this.#EventManager[service  as string].pre.push(listener);
        return this;
    }
    post(service: keyof SERVICES, listener: ListenerPostSchema){
        if (!this.#EventManager[service as string]) {
            this.#EventManager[service as string] = {
                pre: [],
                post: [],
            };
        }
        this.#EventManager[service as string].post.push(listener);
        return this;
    }
}
export function ctrlAccessValidator(ctx: ContextSchema, access?: string) {
    access = access || 'any';
    return access == 'any' ? true : (access == ctx.__permission);
}

