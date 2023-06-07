import Log from "sublymus_logger";
import STATUS from "./Errors/STATUS";
import { ContextSchema } from "./Context";
import { Controllers, ControllerSchema, CtrlMakerSchema, EventPostSchema, EventPreSchema, ListenerPostSchema, ListenerPreSchema, MoreSchema, ResponseSchema, ResultSchema, SaveCtrlOptionSchema, Tools, ToolsInterface } from "./Initialize";
import { UNDIFINED_RESULT } from "./ModelCtrlManager";
/*88888888888888888888

NB:  les nom de model sont en lowercase : my_controller is well

8888888888888888888*/
 
const CtrlManager = (option: SaveCtrlOptionSchema): CtrlMakerSchema => {
    let ctrl: ControllerSchema;
    let name: string='';
    const EventManager: {
        [p: string]: {
            pre: ListenerPreSchema[];
            post: ListenerPostSchema[];
        };
    } = {};
    const callPre: (e: EventPreSchema) => Promise<void | ResultSchema> = async (e: EventPreSchema) => {
        try {

            if (!(EventManager[e.ctx.service]?.pre)) return

            for (const listener of EventManager[e.ctx.service].pre) {

                if (listener) return await listener(e);
            }
        } catch (error) {
            Log('ERROR_Ctrl_callPre', error);
        }
    };
    const callPost: (e: EventPostSchema) => ResponseSchema = async (
        e: EventPostSchema
      ) => {
        try {
          if (!EventManager[e.ctx.service]?.post) return e.res;
          for (const listener of EventManager[e.ctx.service].post) {
            if (listener){
              const r = await listener(e);
              if(r) return r ;
            }  
          }
          return e.res;
        } catch (error) {
          Log("ERROR_callPost", error);
        }
        return e.res;
      };
    const observableCtrl: ControllerSchema = {};
    for (const key in option.ctrl) {
        if (Object.prototype.hasOwnProperty.call(option.ctrl, key)) {
            ctrl = option.ctrl[key];
            name = key;
            for (const service in ctrl) {
                if (Object.prototype.hasOwnProperty.call(ctrl, service)) {
                    observableCtrl[service] = async (ctx: ContextSchema, more?: MoreSchema): ResponseSchema => {
                        if (!ctrlAccessValidator(ctx, option.access?.[service])) {
                            return await callPost({
                                ctx,
                                more,
                                res: {
                                    error: "BAD_AUTH",
                                    ...(await STATUS.BAD_AUTH(ctx, {
                                        target: 'SERVER:' + service.toLocaleUpperCase(),
                                    })),
                                },
                            });
                        }
                        const preRes = await callPre({
                            ctx,
                            more,
                        });
                        if (preRes) return preRes
                        return await callPost({
                            ctx,
                            res: await ctrl[service](ctx, more)||UNDIFINED_RESULT,
                            more
                        });
                    };
                }
            }
            break;
        }
    }
    if(!name){
       throw new Error("Controller Object is not difined");
       
        
    }
    const ctrlMaker: CtrlMakerSchema = () => {
        return observableCtrl
    };
    ctrlMaker.option = option;

    ctrlMaker.pre = (service: string, listener: ListenerPreSchema): CtrlMakerSchema => {
        if (!EventManager[service]) {
            EventManager[service] = {
                pre: [],
                post: [],
            };
        }
        EventManager[service].pre.push(listener);
        return ctrlMaker;
    };
    ctrlMaker.post = (service: string, listener: ListenerPostSchema): CtrlMakerSchema => {
        if (!EventManager[service]) {
            EventManager[service] = {
                pre: [],
                post: [],
            };
        }
        EventManager[service].post.push(listener);
        return ctrlMaker;
    };
    ;
    ctrlMaker.tools = {} as (ToolsInterface & { maker: CtrlMakerSchema });
    ctrlMaker.tools.maker = ctrlMaker;

    for (const tool in Tools) {
        if (Object.prototype.hasOwnProperty.call(Tools, tool)) {
            const func = Tools[tool];
            ctrlMaker.tools
            ctrlMaker.tools[tool] = func.bind( ctrlMaker.tools);
        }
    }
    return Controllers[name] = ctrlMaker;
}
export function ctrlAccessValidator(ctx: ContextSchema, access?: string) {
    access = access || 'any';
    return access == 'any' ? true : (access == ctx.__permission);
}

export { CtrlManager };

