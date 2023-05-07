import mongoose from "mongoose";
import Log from "sublymus_logger";
import { ContextSchema } from "../Context";
import { CtrlManager } from "../CtrlManager";
import { ControllerSchema, DescriptionSchema, ModelControllers, MoreSchema, ResponseSchema } from "../Initialize";
import { parentInfo } from "../ModelCtrlManager";
import { SQuery } from "../SQuery";
import { accessValidator } from "../AccessManager";
const server: ControllerSchema = {

    currentUser: async (ctx: ContextSchema): ResponseSchema => {
        const token = await SQuery.cookies(ctx.socket, 'token');
        return {
            response: {
                login: {
                    modelPath: token.__loginModelPath,
                    id: token.__loginId,
                },
                signup: {
                    modelPath: token.__signupModelPath,
                    id: token.__signupId
                }
            },
            status: 202,
            code: "OPERATION_SUCCESS",
            message: ''
        }
    },
    description: async (ctx: ContextSchema): ResponseSchema => {
        try {
            const valid = accessValidator({
                ...ctx,
                service:'read'
            }, ModelControllers[ctx.data.modelPath]?.option.access, 'controller');
            //Log('Description_valid_access:', valid, '; ctrlAccess:', ModelControllers[ctx.data.modelPath]?.option.access, '; __permission =', ctx.__permission, '; modelPath:',ctx.data.modelPath)

            if (!valid) throw new Error("ACCESS_REFUSED:"+ctx.data.modelPath);

            const description: DescriptionSchema = { ...ModelControllers[ctx.data.modelPath]?.option.schema.description };

            for (const key in description) {

                if (Object.prototype.hasOwnProperty.call(description, key)) {
                    const rule = { ...description[key] };

                    if (Array.isArray(rule)) {
                        if (rule[0].access == 'secret') {
                            delete description[key];
                            continue;
                        }
                        (rule[0] as any).type = rule[0].type?.name
                        if (rule[0].match) {
                            (rule[0] as any).match = rule[0].match.toString()
                        }
                    } else if (!Array.isArray(rule)) {
                        if (rule.access == 'secret') {
                            delete description[key];
                            continue;
                        }
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
                error: "OPERATION_FAILED",
                status: 404,
                code: "OPERATION_FAILED",
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

                ctx.data.modelPath = key
                descriptions[key] = (await server.description(ctx, more)).response;
            }
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
    instanceId :async (ctx: ContextSchema): ResponseSchema =>{
        const local_modelInstance = await ModelControllers[
            ctx.data.modelPath
        ].option.model.findOne({
          _id: ctx.data.id,
        });
        if (!local_modelInstance) {
          Log( "ERROR_validId", `Id not found; modePath:${ctx.data.modelPath} alienId: ${ctx.data.id}  alienModelPath: ${ctx.data.modelPath}`);
          throw new Error(`Id not found; modePath:${ctx.data.modelPath} alienId: ${ctx.data.id}  alienModelPath: ${ctx.data.modelPath}`);
        }
        return {
            response: true,
            status: 404,
            code: "OPERATION_SUCCESS",
            message: 'OPERATION_SUCCESS',
        };
      },
    validId: async (ctx: ContextSchema): ResponseSchema => {
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
    extractor: async (ctx: ContextSchema): ResponseSchema => {
        try {
            const { modelPath, id, extractorPath } = ctx.data as { modelPath: string, id: string, extractorPath: string };
            const parts = extractorPath.split('/');
            const illegalMessage = "illegal argument : " + extractorPath + " ; Example : './' , './account' , '../' , '../../account/profile' ,  ";

            if (parts[0] != '.' && parts[0] != '..') throw new Error(illegalMessage);
            let canStart = true;
            let canUpToParent = true;
            let accu = '';

            const isValidProperty = (part: string) => {
                return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(part);
            }
            // //let current:any = ModelControllers[]
            // const isValidArrayProperty = (part: string) => {
            //     return /^[a-zA-Z_][a-zA-Z0-9_]*\[([0-9]{1,4})\]$/.test(part);
            // 
            let res = await ModelControllers[modelPath]().read({
                ...ctx,
                data: { id }
            });
            if (!res || res.error) {
                return {
                    error: "OPERATION_FAILED",
                    status: 404,
                    code: "OPERATION_FAILED",
                    message: "modelPath = " + modelPath + " ; id = " + id + " is not found; serverMessage = " + + JSON.stringify(res),
                }
            }
            let currentDoc = res.response;
            let currentModelPath = modelPath;
            let currentDescription: DescriptionSchema = ModelControllers[modelPath].option.schema.description;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                accu += part + '/'
                if (part == '') continue;
                else if (part == '.') {
                    if (!canStart) throw new Error("< . >  is only use to start the path, Example: ./p1/p2 , currentPath:" + accu + " <-- is not correct;   " + illegalMessage);
                    canStart = false;
                    canUpToParent = false;

                } else if (part == '..') {
                    if (!canUpToParent) throw new Error("< .. >  is Only use at the start of the path, Example: ../../../p1/p2 , currentPath:" + accu + " <-- is not correct;   " + illegalMessage);

                    const info = parentInfo(currentDoc.__parentModel)
                    res = await ModelControllers[info.parentModelPath]().read({
                        ...ctx,
                        data: { id: info.parentId }
                    });
                    if (!res || res.error) {
                        return {
                            error: "OPERATION_FAILED",
                            status: 404,
                            code: "OPERATION_FAILED",
                            message: "currentPath : " + accu + " <-- is not found; modelPath = " + modelPath + " ; id = " + id + " is not found; serverMessage = " + res,
                        }
                    }
                    currentDoc = res.response;
                    currentModelPath = info.parentModelPath;
                    currentDescription = ModelControllers[info.parentModelPath].option.schema.description;
                } else if (isValidProperty(part)) {
                    canUpToParent = false;
                    const rule = currentDescription[part];
                    if (!rule) {
                        throw new Error("currentPath : " + accu + " <-- is not found;   ");
                    }
                    else if (Array.isArray(rule) && rule[0].ref) {
                        throw new Error("currentPath : " + accu + " <-- is ObjectId array property ; You must recover his parent  ");
                    }
                    else if (Array.isArray(rule)) {
                        throw new Error("currentPath : " + accu + " <-- is array property ; You must recover his parent  ");
                    }
                    else if (!Array.isArray(rule) && !rule.ref) {
                        throw new Error("currentPath : " + accu + " <-- is not a ObjectId property ; ; You must recover his parent  ");
                    }
                    let res = await ModelControllers[rule.ref]().read({
                        ...ctx,
                        data: { id: currentDoc[part] }
                    });
                    if (!res || res.error) {
                        return {
                            error: "OPERATION_FAILED",
                            status: 404,
                            code: "OPERATION_FAILED",
                            message: "modelPath = " + rule.ref + " ; id = " + currentDoc[part] + " is not found; serverMessage = " + JSON.stringify(res),
                        }
                    }
                    currentDoc = res.response;
                    currentModelPath = rule.ref;
                    currentDescription = ModelControllers[rule.ref].option.schema.description;
                } else {
                    throw new Error(illegalMessage);
                }
            }
            const result = {
                modelPath: currentModelPath,
                id: currentDoc._id.toString()
            };
            Log('result', { result });
            return {
                response: result,
                status: 200,
                code: "OPERATION_SUCCESS",
                message: 'OPERATION_SUCCESS',
            }
        } catch (error) {
            return {
                error: "ILLEGAL_ARGUMENT",
                status: 407,
                code: "ILLEGAL_ARGUMENT",
                message: error.message,
            };
        }
    },
}

const ctrlMaker = CtrlManager({
    ctrl: { server },
    access: {
        description: "any"
    }
})


















