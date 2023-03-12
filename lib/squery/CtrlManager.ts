import Log from "sublymus_logger";
import { Controllers, ControllerSchema, CtrlMakerSchema, SaveCtrlOptionSchema } from "./Initialize";
/*88888888888888888888

NB:  les nom de model sont en lowercase : my_controller is well

8888888888888888888*/

const SaveCtrl = (option: SaveCtrlOptionSchema): CtrlMakerSchema => {
    let ctrl: ControllerSchema = null;
    let name: string;
    for (const key in option.ctrl) {
        if (Object.prototype.hasOwnProperty.call(option.ctrl, key)) {
            ctrl = option.ctrl[key];
            name = key;
            break;
        }
    }
    name = option.name || name.toLocaleLowerCase();
    const f = () => {
        return ctrl
    };
    f.option = option;
    Controllers[name] = f as CtrlMakerSchema;
    Log('ctrl', name);

    return Controllers[name];
}

export { SaveCtrl };

