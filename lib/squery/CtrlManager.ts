import Log from "sublymus_logger";
import STATUS from "../../App/Errors/STATUS";
import { ContextSchema } from "./Context";
import { Controllers, ControllerSchema, CtrlMakerSchema, EventPostSchema, EventPreSchema, ListenerPostSchema, ListenerPreSchema, MoreSchema, ResponseSchema, SaveCtrlOptionSchema, Tools, ToolsInterface } from "./Initialize";
/*88888888888888888888

NB:  les nom de model sont en lowercase : my_controller is well

8888888888888888888*/

const CtrlManager = (option: SaveCtrlOptionSchema): CtrlMakerSchema => {
    let ctrl: ControllerSchema = null;
    let name: string;
    const EventManager: {
        [p: string]: {
            pre: ListenerPreSchema[];
            post: ListenerPostSchema[];
        };
    } = {};
    const callPre: (e: EventPreSchema) => Promise<void> = async (e: EventPreSchema) => {
        try {

            if (!(EventManager[e.ctx.service]?.pre)) return

            for (const listener of EventManager[e.ctx.service].pre) {

                if (listener) await listener(e);
            }
        } catch (error) {
            Log('ERROR_Ctrl_callPre',error);
        }
    };
    const callPost: (e: EventPostSchema) => ResponseSchema = async (e: EventPostSchema) => {
        try {
            if (!(EventManager[e.ctx.service]?.post)) return e.res;

            for (const listener of EventManager[e.ctx.service].post) {
                if (listener) await listener(e);
            }
            return e.res;
        } catch (error) {
            Log('ERROR_Ctrl_callPost',error);
        }
    };
    const observableCtrl: ControllerSchema = {};
    for (const key in option.ctrl) {
        if (Object.prototype.hasOwnProperty.call(option.ctrl, key)) {
            ctrl = option.ctrl[key];
            name = key;
            for (const service in ctrl) {
                if (Object.prototype.hasOwnProperty.call(ctrl, service)) {
                    observableCtrl[service] = async (ctx: ContextSchema, more: MoreSchema): ResponseSchema => {
                        if (!ctrlAccessValidator(ctx, option.access[service])) {
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
                        await callPre({
                            ctx,
                            more
                        });
                        return await callPost({
                            ctx,
                            res: await ctrl[service](ctx, more),
                            more
                        });
                    };
                }
            }
            break;
        }
    }
    name = option.name || name;
    const ctrlMaker :CtrlMakerSchema = () => {
        return observableCtrl
    };
    ctrlMaker.option = option;

    ctrlMaker.pre = (service: string, listener: ListenerPreSchema):CtrlMakerSchema => {
        if (!EventManager[service]) {
            EventManager[service] = {
                pre: [],
                post: [],
            };
        }
        EventManager[service].pre.push(listener);
        return ctrlMaker;
    };
    ctrlMaker.post = (service: string, listener: ListenerPostSchema):CtrlMakerSchema => {
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
        ctrlMaker.tools[tool] = func.bind(ctrlMaker.tools);
      }
    }
    return Controllers[name] = ctrlMaker;
}
export function ctrlAccessValidator(ctx: ContextSchema, access: string) {
    access = access || 'any';
    return access == 'any' ? true : (access == ctx.__permission);
}

export { CtrlManager };

