import Log from "sublymus_logger";
import STATUS from "../../App/Errors/STATUS";
import { ContextSchema } from "./Context";
import { Controllers, ControllerSchema, CtrlMakerSchema, EventPostSchema, EventPreSchema, ListenerPostSchema, ListenerPreSchema, MoreSchema, ResponseSchema, SaveCtrlOptionSchema } from "./Initialize";
/*88888888888888888888

NB:  les nom de model sont en lowercase : my_controller is well

8888888888888888888*/

const SaveCtrl = (option: SaveCtrlOptionSchema): CtrlMakerSchema => {
    let ctrl: ControllerSchema = null;
    let name: string;
    const EventManager: {
        [p: string]: {
            pre: ListenerPreSchema[];
            post: ListenerPostSchema[];
        };
    } = {};
    const callPre: (e: EventPreSchema) => Promise<void> = async (e: EventPreSchema) => {

        if (!(EventManager[e.action]?.pre)) return

        for (const listener of EventManager[e.action].pre) {

            if (listener) await listener(e);
        }
    };
    const callPost: (e: EventPostSchema) => ResponseSchema = async (e: EventPostSchema) => {
        if (!(EventManager[e.action]?.post)) return e.res;

        for (const listener of EventManager[e.action].post) {
            if (listener) await listener(e);
        }
        return e.res;
    };
    const observableCtrl: ControllerSchema = {};
    for (const key in option.ctrl) {
        if (Object.prototype.hasOwnProperty.call(option.ctrl, key)) {
            ctrl = option.ctrl[key];
            name = key;
            for (const action in ctrl) {
                if (Object.prototype.hasOwnProperty.call(ctrl, action)) {
                    observableCtrl[action] = async (ctx: ContextSchema, more: MoreSchema): ResponseSchema => {
                        if (!ctrlAccessValidator(ctx, option.access[action])) {
                            return await callPost({
                                ctx,
                                more: { ...more },
                                action,
                                res: {
                                    error: "BAD_AUTH",
                                    ...(await STATUS.BAD_AUTH(ctx, {
                                        target: 'SERVER:' + action.toLocaleUpperCase(),
                                    })),
                                },
                            });
                        }
                        await callPre({
                            ctx,
                            action,
                            more
                        });
                        return await callPost({
                            action,
                            ctx,
                            res: await ctrl[action](ctx, more),
                            more
                        });
                    };
                }
            }
            break;
        }
    }
    name = option.name || name.toLocaleLowerCase();
    const ctrlMaker = () => {
        return observableCtrl
    };
    ctrlMaker.option = option;

    ctrlMaker.pre = (action: string, listener: ListenerPreSchema) => {
        if (!EventManager[action]) {
            EventManager[action] = {
                pre: [],
                post: [],
            };
        }
        EventManager[action].pre.push(listener);
    };
    ctrlMaker.post = (action: string, listener: ListenerPostSchema) => {
        if (!EventManager[action]) {
            EventManager[action] = {
                pre: [],
                post: [],
            };
        }
        EventManager[action].post.push(listener);
    };
    Controllers[name] = ctrlMaker as CtrlMakerSchema;
    Log('ctrl', name);

    return Controllers[name];
}
function ctrlAccessValidator(ctx: ContextSchema, access: string) {
    Log('access', {ok: access == 'any' ? true : (access == ctx.__permission),access , permission: ctx.__permission});
    return access == 'any' ? true : (access == ctx.__permission);
}

export { SaveCtrl };

