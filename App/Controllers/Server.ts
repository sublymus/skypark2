import mongoose from "mongoose";
import { ContextSchema } from "../../lib/squery/Context";
import { SaveCtrl } from "../../lib/squery/CtrlManager";
import { ControllerSchema, DescriptionSchema, ModelControllers, MoreSchema, ResponseSchema } from "../../lib/squery/Initialize";

const Server: ControllerSchema = {


    description: async (ctx: ContextSchema): ResponseSchema => {
        try {
            const description: DescriptionSchema = { ...(ModelControllers[ctx.data.modelPath]?.option.schema as any).description };

            for (const key in description) {
                if (key == '__key') {
                    delete description["__key"];
                    continue
                };
                if (key == 'updatedProperty') {
                    delete description["updatedProperty"];
                    continue
                };
                if (Object.prototype.hasOwnProperty.call(description, key)) {
                    const rule = description[key] = { ...description[key] };
                    if (Array.isArray(rule)) {
                        (rule[0] as any).type = rule[0].type?.name
                        if (rule[0].match) {
                            (rule[0] as any).match = rule[0].match.toString()
                        }
                    } else if (!Array.isArray(rule)) {
                        (rule as any).type = rule.type?.name
                        if (rule.match) {
                            const s = rule.match.toString();
                            (rule as any).match = s.substring(1, s.lastIndexOf('/'));
                        }
                    }
                }
            }
            return {
                response: description,
                status: 202,
                code: "OPERATION_SUCCESS",
                message: ''
            }
        } catch (error) {
            return {
                error: "NOT_FOUND",
                status: 404,
                code: "UNDEFINED",
                message: error.message,
            };
        }
    },
    descriptions: async (ctx: ContextSchema, more: MoreSchema): ResponseSchema => {
        try {
            const descriptions: {
                [p: string]: DescriptionSchema,
            } = {}

            for (const key in ModelControllers) {
                /// TODO verifier la permitsson   
                //if (accessValidator(ctx, '', ModelControllers[key].option.access, 'controller'))
                ctx.data.modelPath = key
                descriptions[key] = (await Server.description(ctx, more)).response;
               // console.log('1', key, descriptions[key]);

            }
           // console.log('2', descriptions);
            return {
                response: descriptions,
                status: 202,
                code: "OPERATION_SUCCESS",
                message: ''
            }
        } catch (error) {
            return {
                error: "NOT_FOUND",
                status: 404,
                code: "UNDEFINED",
                message: error.message,
            };
        }
    },
    valideId: async (ctx: ContextSchema): ResponseSchema => {
        try {

            if (new mongoose.Types.ObjectId(ctx.data.id)._id.toString() == ctx.data.id) {
                return {
                    response: true,
                    status: 404,
                    code: "OPERATION_SUCCESS",
                    message: 'OPERATION_SUCCESS',
                };
            }
            throw new Error("ID is not valid");

        } catch (error) {
            return {
                error: "BAD_ARGUMENT",
                status: 404,
                code: "BAD_ARGUMENT",
                message: error.message,
            };
        }
    },
}

const ctrlMaker = SaveCtrl({
    ctrl: { Server },
    access: {
        description: "any"
    }
})


ctrlMaker.pre('description', async (e) => {
    await new Promise((rev => {
        const d = Date.now() + 100
        const t = () => {
            console.log(Date.now());
            if (d < Date.now()) {
                return rev(d);
            }
            setTimeout(t, 10)
        }
        t()
    }))
})
ctrlMaker.post('description', async (e) => {
    await new Promise((rev => {
        const d = Date.now() + 100
        const t = () => {
            console.log('_________________' + Date.now());
            if (d < Date.now()) {
                return rev(d);
            }
            setTimeout(t, 10)
        }
        t()

    }))
})


















