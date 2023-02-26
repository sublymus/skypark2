import mongoose from "mongoose";
import fs from "node:fs";
import Log from "sublymus_logger";
import STATUS from "../../App/Errors/STATUS";
import { Config } from "../../squeryconfig";
import { ContextSchema } from "./Context";
import { AloFiles, Controllers, ControllerSchema, CtrlMakerSchema, EventPostSchema, EventPreSchema, EventSting, From_optionSchema, ListenerPostSchema, ListenerPreSchema, ModelInstanceSchema, MoreSchema, PopulateSchema, ResponseSchema, RestSchema, RuleSchema, TypeRuleSchema } from "./Initialize";

// les tableau 2D sont pas tolere
const MakeCtlForm: (option: From_optionSchema) => CtrlMakerSchema = (
    option: From_optionSchema
): CtrlMakerSchema => {
    const EventManager: {
        [p: string]: {
            pre: ListenerPreSchema[];
            post: ListenerPostSchema[];
        };
    } = {};
    const callPre: (e: EventPreSchema) => void = (e: EventPreSchema) => {
        EventManager[e.event]?.pre.forEach((listener) => {
           listener(e);
        });
    };
    const callPost: (e: EventPostSchema) => RestSchema = (e: EventPostSchema) => {
        EventManager[e.event]?.post.forEach((listener) => {
            listener(e);
        });
        return e.res;
    };
    const ctrlMaker = function () {
        const controller: ControllerSchema = {};
        controller[option.volatile ? "create" : "store"] = async (
            ctx,
            more
        ): ResponseSchema => {
            const event = option.volatile ? "create" : "store";
            if (!accessValidator(ctx, event, option.access, "controller")) {
                return callPost({
                    ctx,
                    more: {...more },
                    event,
                    res: {
                        error: "BAD_AUTH",
                        ...(await STATUS.BAD_AUTH(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            callPre({
                ctx,
                more: {...more},
                event,
            });
            const description = option.schema.obj;
            if (!more) {
                more = {};
                more.savedlist = [];
            }
            const accu = {};
            let modelInstance: ModelInstanceSchema;
            const modelId = new mongoose.Types.ObjectId().toString();
            if (!ctx.__key) ctx.__key = new mongoose.Types.ObjectId().toString(); ///// cle d'auth

            for (const property in description) {
                if (Object.prototype.hasOwnProperty.call(description, property)) {
                    const rule = description[property];
                    if (rule.ref) {
                        const ctrl = Controllers[rule.ref]();
                        // Log('log', { property, value: ctx.data[property], modelPath: option.modelPath })
                        const res = await (ctrl.create || ctrl.store)(
                            {
                                ...ctx,
                                data: {
                                    ...ctx.data[property],
                                },
                            },
                            more
                        );
                        // Log('log', { res, property, value: ctx.data[property], modelPath: option.modelPath })
                        if (!res) {
                            more.modelPath = option.modelPath;
                            await backDestroy(ctx, more);
                            // Log('log', { res })
                            return callPost({
                                ctx,
                                more: {...more},
                                event,
                                res: {
                                    error: "ACCESS_NOT_FOUND",
                                    status: 404,
                                    code: "ACCESS_NOT_FOUND",
                                    message: "access not found for Model: " + option.modelPath,
                                },
                            });
                        }
                        if (res.error) {
                            more.modelPath = option.modelPath;
                            await backDestroy(ctx, more);
                            return callPost({
                                ctx,
                                more: {...more },
                                event,
                                res,
                            });
                        }
                        accu[property] = res.response;
                    } else if (Array.isArray(rule) && rule[0].ref) {
                        ctx.data[property] = Array.isArray(ctx.data[property])
                            ? ctx.data[property]
                            : [];
                        accu[property] = [];
                        const ctrl = Controllers[rule[0].ref]();
                        for (let i = 0; i < ctx.data[property].length; i++) {
                            const res = await (ctrl.create || ctrl.store)(
                                {
                                    ...ctx,
                                    data: {
                                        ...ctx.data[property][i],
                                    },
                                },
                                more
                            );
                            // Log('log', { res, property, value: ctx.data[property][i], modelPath: option.modelPath })
                            if (!res) {
                                more.modelPath = option.modelPath;
                                await backDestroy(ctx, more);
                                //Log('log', { res })
                                return callPost({
                                    ctx,
                                    more: {...more },
                                    event,
                                    res,
                                });
                            }
                            if (res.error) {
                                more.modelPath = option.modelPath;
                                await backDestroy(ctx, more);
                                return callPost({
                                    ctx,
                                    more: {...more },
                                    event,
                                    res,
                                });
                            }
                            accu[property][i] = res.response;
                        }
                    } else if (Array.isArray(rule) && rule[0].file) {
                        // accu[property] = await FileValidator(ctx, event, rule[0], ctx.data[property])
                        try {
                            accu[property] = await FileValidator(
                                ctx,
                                event,
                                rule[0],
                                AloFiles.files
                            );
                        } catch (error) {
                            await backDestroy(ctx, more);
                            return callPost({
                                ctx,
                                more: {...more },
                                event,
                                res: {
                                    error: "NOT_CREATED",
                                    ...(await STATUS.NOT_CREATED(ctx, {
                                        target: option.modelPath.toLocaleUpperCase(),
                                        message: error.message,
                                    })),
                                },
                            });
                        }
                    } else {
                        accu[property] = ctx.data[property];
                    }
                }
            }
            accu["__key"] = ctx.__key;
            // Log('logAccu', { accu });
            try {
                modelInstance = new option.model({
                    ...accu,
                    _id: modelId,
                });
                await modelInstance.save();
                more.savedlist.push({
                    modelId,
                    __key: ctx.__key,
                    volatile: option.volatile,
                    controller,
                });
            } catch (error) {
                //Log('error', error);
                more.modelPath = option.modelPath;
                await backDestroy(ctx, more);
                return callPost({
                    ctx,
                    more: {...more },
                    event,
                    res: {
                        error: "NOT_CREATED",
                        ...(await STATUS.NOT_CREATED(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                            message: error.message,
                
                        })),
                    },
                });
            }
            //Log('apresPromise', modelId)
            return callPost({
                ctx,
                more: {...more , modelInstance},
                event,
                res: {
                    response: modelId, 
                    ...(await STATUS.CREATED(ctx, {
                        target: option.modelPath.toLocaleUpperCase(),
                    })),
                },
            });
        };
        controller["read"] = async (ctx, more): ResponseSchema => {
            const event = "read";
            if (!accessValidator(ctx, event, option.access, "controller")) {
                return callPost({
                    ctx,
                    more: {...more },
                    event,
                    res: {
                        error: "BAD_AUTH",
                        ...(await STATUS.BAD_AUTH(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            callPre({
                ctx,
                more: {...more},
                event,
            });
            let modelInstance: ModelInstanceSchema;
            try {
                modelInstance = await option.model.findOne({
                    _id: ctx.data.id,
                });

                if (!modelInstance) {
                    return callPost({
                        ctx,
                        more: {...more , modelInstance},
                        event,
                        res: {
                            error: "NOT_FOUND",
                            ...(await STATUS.NOT_FOUND(ctx, {
                                target: option.modelPath.toLocaleUpperCase(),
                            })),
                        },
                    });
                }
                const info: PopulateSchema = {};
                deepPopulate(
                    ctx,
                    event,
                    option.model.modelName,
                    info,
                    modelInstance.__key._id.toString() == ctx.__key//isUser
                );
                await modelInstance.populate(info.populate);
                const propertys = info.select.replaceAll(" ", "").split("-");
                propertys.forEach((p) => {
                    modelInstance[p] = undefined;
                });
                //await modelInstance.select(i)
            } catch (error) {
                return callPost({
                    ctx,
                    more: {...more , modelInstance},
                    event,
                    res: {
                        error: "NOT_FOUND catch",
                        ...(await STATUS.NOT_FOUND(ctx, {
                            target: "ACCOUNT",
                            message: error.message,
                        })),
                    },
                });
            }

            return callPost({
                ctx,
                more: {...more , modelInstance},
                event,
                res: {
                    response: modelInstance,
                    ...(await STATUS.OPERATION_SUCCESS(ctx, {
                        target: "ACCOUNT",
                    })),
                },
            });
        };

        controller["update"] = async (ctx, more): ResponseSchema => {
            const event = "update";
            if (!accessValidator(ctx, event, option.access, "controller")) {
                return callPost({
                    ctx,
                    more: {...more },
                    event,
                    res: {
                        error: "BAD_AUTH",
                        ...(await STATUS.BAD_AUTH(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            callPre({
                ctx,
                more: {...more },
                event,
            });

            let modelInstance: ModelInstanceSchema;
            const description = option.schema.obj;

            try {
                modelInstance = await option.model.findOne({
                    _id: ctx.data.id,
                });
                if (!modelInstance) {
                    return callPost({
                        ctx,
                        more: {...more , modelInstance},
                        event,
                        res: {
                            error: "NOT_FOUND",
                            ...(await STATUS.NOT_FOUND(ctx, {
                                target: option.modelPath.toLocaleUpperCase(),
                            })),
                        },
                    });
                }
                for (const p in description) {
                    if (Object.prototype.hasOwnProperty.call(description, p)) {
                        const rule = description[p];
                        if (!ctx.data[p]) continue;
                        if (rule.ref) continue;
                        if (
                            !accessValidator(
                                ctx,
                                event,
                                rule.access,
                                "property",
                                modelInstance.__key._id.toString() == ctx.__key
                            )
                        ) {
                            continue;
                        } else if (Array.isArray(rule)) {
                            if (rule[0].ref) {

                            } else if (rule[0].file) {
                                //modelInstance[p] = await FileValidator(ctx, event, rule[0], ctx.data[p], modelInstance[p])
                                try {
                                    modelInstance[p] = await FileValidator(
                                        ctx,
                                        event,
                                        rule[0],
                                        AloFiles.files,
                                        modelInstance[p]
                                    );
                                } catch (error) {
                                    return callPost({
                                        ctx,
                                        more: {...more , modelInstance},
                                        event,
                                        res: {
                                            error: "NOT_FOUND",
                                            ...(await STATUS.NOT_FOUND(ctx, {
                                                target: option.modelPath.toLocaleUpperCase(),
                                            })),
                                        },
                                    });
                                }
                            } else {
                            }
                        } else {
                            modelInstance[p] = ctx.data[p];
                        }
                    }
                }
            } catch (error) {
                return callPost({
                    ctx,
                    more: {...more , modelInstance},
                    event,
                    res: {
                        error: "NOT_FOUND",
                        ...(await STATUS.NOT_FOUND(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                            message: error.message,
                        })),
                    },
                });
            }

            try {
                await modelInstance.save();
            } catch (error) {
                return callPost({
                    ctx,
                    more: {...more , modelInstance},
                    event,
                    res: {
                        error: "OPERATION_FAILED",
                        ...(await STATUS.OPERATION_FAILED(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                            message: error.message,
                        })),
                    },
                });
            }

            return callPost({
                ctx,
                more: {...more , modelInstance},
                event,
                res: {
                    response: await (await controller.read(ctx)).response,
                    ...(await STATUS.OPERATION_SUCCESS(ctx, {
                        target: option.modelPath.toLocaleUpperCase(),
                    })),
                },
            });
        };

        controller[option.volatile ? "delete" : "destroy"] = async (
            ctx,
            more
        ): ResponseSchema => {
            const event = option.volatile ? "delete" : "destroy";
            if (!accessValidator(ctx, event, option.access, "controller")) {
                return callPost({
                    ctx,
                    more: {...more},
                    event,
                    res: {
                        error: "BAD_AUTH",
                        ...(await STATUS.BAD_AUTH(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            callPre({
                ctx,
                more: {...more},
                event,
            });
            let modelInstance: ModelInstanceSchema;
            const description = option.schema.obj;
            try {
                modelInstance = await option.model.findOne({
                    _id: ctx.data.id,
                    __key: ctx.__key,
                });
                if (!modelInstance) {
                    return callPost({
                        ctx,
                        more: {...more , modelInstance},
                        event,
                        res: {
                            error: "NOT_FOUND",
                            ...(await STATUS.NOT_FOUND(ctx, {
                                target: option.modelPath.toLocaleUpperCase(),
                            })),
                        },
                    });
                }
                for (const p in description) {
                    if (Object.prototype.hasOwnProperty.call(description, p)) {
                        const rule = description[p];
                        if (rule.ref) {
                            const ctrl = Controllers[rule.ref]();
                            const res = await (ctrl.delete || ctrl.destroy)({
                                ...ctx,
                                data: {
                                    __key: ctx.__key,
                                    id: modelInstance[p],
                                },
                            });
                        } else if (Array.isArray(rule) && rule[0].ref) {
                            for (let i = 0; i < modelInstance[p].length; i++) {
                                const ctrl = Controllers[rule[0].ref]();
                                const res = await (ctrl.delete || ctrl.destroy)({
                                    ...ctx,
                                    data: {
                                        ...ctx.data,
                                        id: modelInstance[p][i],
                                    },
                                });
                            }
                        } else if (Array.isArray(rule) && rule[0].file) {
                            //await FileValidator(ctx, event, rule[0], ctx.data[p], modelInstance[p])
                            try {
                                const res = await FileValidator(
                                    ctx,
                                    event,
                                    rule[0],
                                    AloFiles.files,
                                    modelInstance[p]
                                );
                            } catch (error) {
                                return callPost({
                                    ctx,
                                    more: {...more , modelInstance},
                                    event,
                                    res: {
                                        error: "NOT_FOUND",
                                        ...(await STATUS.NOT_FOUND(ctx, {
                                            target: option.modelPath.toLocaleUpperCase(),
                                        })),
                                    },
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                return callPost({
                    ctx,
                    more: {...more , modelInstance},
                    event,
                    res: {
                        error: "NOT_FOUND",
                        ...(await STATUS.NOT_FOUND(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            try {
                modelInstance.remove();
            } catch (error) {
                return callPost({
                    ctx,
                    more: {...more , modelInstance},
                    event,
                    res: {
                        error: "NOT_DELETED",
                        ...(await STATUS.NOT_DELETED(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                            /////////////////    super important  //////////////////////
                        })),
                    },
                });
            }

            return callPost({
                ctx,
                more: {...more , modelInstance},
                event,
                res: {
                    response: "OPERATION_SUCCESS",
                    ...(await STATUS.DELETED(ctx, {
                        target: option.modelPath.toLocaleUpperCase(),
                    })),
                },
            });
        };
        return controller;
    };



    ctrlMaker.option = option;

    ctrlMaker.pre = (event: EventSting, listener: ListenerPreSchema) => {
        if (!EventManager[event]) {
            EventManager[event] = {
                pre: [],
                post: [],
            };
        }
        EventManager[event].pre.push(listener);
    };
    ctrlMaker.post = (event: EventSting, listener: ListenerPostSchema) => {
        if (!EventManager[event]) {
            EventManager[event] = {
                pre: [],
                post: [],
            };
        }
        EventManager[event].post.push(listener);
    };
    return (Controllers[option.modelPath] = ctrlMaker);
};


function deepPopulate(
    ctx: ContextSchema,
    event: EventSting,
    ref: string,
    info: PopulateSchema,
    isUser?: boolean
) {
    const description = Controllers[ref].option.schema.obj;
    info.populate = [];
    info.select = "";
    for (const p in description) {
        if (Object.prototype.hasOwnProperty.call(description, p)) {
            const rule = description[p];
            if (!accessValidator(ctx, event, rule.access, "property", isUser)) {
                //   Log('no....', ref, p)
                info.select = info.select + " -" + p;
                continue;
            }
            // Log('yes....', ref, p)
            const exec = (rule) => {
                if (rule.populate == true) {
                    const info2 = {
                        path: p,
                    };
                    info.populate.push(info2);
                    deepPopulate(ctx, event, rule.ref, info2, isUser);
                }
            };
            if (rule.ref) {
                exec(rule);
            } else if (Array.isArray(rule) && rule[0].ref) {
                exec(rule[0]);
            }
        }
    }
    return;
}
type FileSchema = {
    type: string;
    size: number;
    fileName: string;
    buffer: NodeJS.ArrayBufferView;
};


function isValideType(ruleTypes: string[], type: string): boolean {
    const typeSide = type.split("/");

    let valide = false;
    Log("type!!", { ruleTypes }, { typeSide });
    ruleTypes.forEach((ruleType) => {
        const ruleSide = ruleType.split("/");
        const match = (side: number): boolean => {
            Log("type", { ruleSide }, { typeSide });
            if (ruleSide[side] == "*") return true;
            else if (
                ruleSide[side].toLocaleLowerCase() == typeSide[side].toLocaleLowerCase()
            )
                return true;
            else return false;
        };

        if (match(0) && match(1)) {
            valide = true;
        }
    });
    Log("type%", { valide });
    return valide;
}
async function FileValidator(
    ctx: ContextSchema,
    event: EventSting,
    rule:TypeRuleSchema ,
    files: FileSchema[],
    actualPaths?: string[]
): Promise<string[]> {
    if (["create", "store", "update"].includes(event)) {
        if (!files) return;
        rule.file.type = rule.file.type || ["*/*"];
        rule.file.size = rule.file.size || 2_000_000;
        rule.file.dir = rule.file.dir || Config.rootDir + "/temp";
        rule.file.length = rule.file.length || 1;

        let sizeMin =
            rule.file.size && Array.isArray(rule.file.size) ? rule.file.size[0] : 0;
        sizeMin = sizeMin < 0 ? 0 : sizeMin;
        let sizeMax = Array.isArray(rule.file.size)
            ? rule.file.size[1]
            : Number.isInteger(rule.file.size)
                ? rule.file.size
                : 10_000_000;
        sizeMax = sizeMax > 15_000_000 ? 15_000_000 : sizeMax;
        let lengthMin =
            rule.file.length && Array.isArray(rule.file.length)
                ? rule.file.length[0]
                : 0;
        lengthMin = lengthMin < 0 ? 0 : lengthMin;
        let lengthMax = Array.isArray(rule.file.length)
            ? rule.file.length[1]
            : Number.isInteger(rule.file.length)
                ? rule.file.length
                : 1;
        lengthMax = lengthMax > 1_000 ? 1_000 : lengthMax;

        if (files.length < lengthMin || files.length > lengthMax)
            throw new Error(
                " Files.length = " +
                files.length +
                "; but must be beetwen [" +
                lengthMin +
                "," +
                lengthMax +
                "]"
            );

        files.forEach((file) => {
            if (file.size < sizeMin || file.size > sizeMax)
                throw new Error(
                    "file.size = " +
                    file.size +
                    "; but must be beetwen [" +
                    sizeMin +
                    "," +
                    sizeMax +
                    "]"
                );
            if (!isValideType(rule.file.type, file.type))
                throw new Error(
                    "file.type = " +
                    file.type +
                    "; but is not valide: [" +
                    rule.file.type.toString() +
                    "]"
                );
        });
    }

    await new Promise((res, rej) => {
        if (!fs.existsSync(rule.file.dir)) {
            fs.mkdir(
                rule.file.dir,
                {
                    recursive: true,
                },
                (err) => {
                    if (err) {
                        rej("");
                        return Log("dir", err);
                    }
                    res("");
                    return Log("dri", "cree");
                }
            );
        } else {
            res("");
        }
    });

    const Map = {
        create: async () => {
            const paths: string[] = [];
            files.forEach((file) => {
                const extension = file.type.substring(file.type.indexOf("/") + 1);
                const path =
                    rule.file.dir +
                    "/" +
                    Date.now() +
                    "_" +
                    new mongoose.Types.ObjectId()._id.toString() +
                    "." +
                    extension;
                fs.writeFileSync(path, file.buffer, "binary");
                paths.push(path);
            });
            Log("paths", "created", paths);
            return paths;
        },
        read: async () => {
            return actualPaths;
        },
        update: async () => {
            const paths: string[] = [];
            files.forEach((file) => {
                const extension = file.type.substring(file.type.indexOf("/") + 1);
                const path =
                    rule.file.dir +
                    "/" +
                    Date.now() +
                    "_" +
                    new mongoose.Types.ObjectId()._id.toString() +
                    "." +
                    extension;
                fs.writeFileSync(path, file.buffer, "binary");
                paths.push(path);
            });
            Log("paths", "created", paths);
            actualPaths.forEach((actualPath) => {
                if (fs.existsSync(actualPath)) {
                    fs.unlink(actualPath, (err) => {
                        if (err) {
                            Log("important", "can not delete", err);
                        }
                        Log("important", "deleted", actualPath);
                    });
                }
            });
            return paths;
        },
        delete: async () => {
            actualPaths.forEach((actualPath) => {
                if (fs.existsSync(actualPath)) {
                    fs.unlink(actualPath, (err) => {
                        if (err) {
                            Log("important", "can not delete", err);
                        }
                        Log("important", "deleted", actualPath);
                    });
                }
            });
            return actualPaths;
        },
    };
    if (event == "store") event = "create";
    else if (event == "destroy") event = "delete";

    return await Map[event]();
}

function accessValidator(
    ctx: ContextSchema,
    event: EventSting,
    access:
        | "public"
        | "share"
        | "admin"
        | "secret"
        | "private"
        | "default"
        | undefined,
    type: "controller" | "property",
    isUser?: boolean
) {
    let valid = false;
    const accessMap = {
        controller: {
            create: {
                public: ["user", "admin", "global"],
                share: ["admin"],
                admin: ["admin"],
                secret: ["admin"],
            },
            read: {
                public: ["user", "admin"],
                share: ["user", "admin"],
                admin: ["user", "admin"],
                secret: ["admin"],
            },
            update: {
                public: ["user", "admin"],
                share: ["user", "admin"],
                admin: ["admin"],
                secret: ["admin"],
            },
            delete: {
                public: ["user", "admin"],
                share: ["admin"],
                admin: ["admin"],
                secret: ["admin"],
            },
        },
        property: {
            read: {
                public: ["global", "user", "admin"],
                default: ["global", "user", "admin"],
                private: ["user", "admin"],
                admin: ["global", "user", "admin"],
                secret: ["admin"],
            },
            update: {
                public: ["global", "user", "admin"],
                default: ["user", "admin"],
                private: ["user", "admin"],
                admin: ["admin"],
                secret: ["admin"],
            },
        },
    };
    if (event == "store") event = "create";
    else if (event == "destroy") event = "delete";

    if (type == "controller" && access == undefined) access = "public";
    if (type == "controller" && access == "private") access = "secret";

    if (type == "property" && access == undefined) access = "default";
    if (type == "property" && access == "share") access = "public";

    let permission = ctx.__permission;
    if (type == "property" && permission == "user") {
        permission = isUser ? "user" : "global";
    }

    valid = accessMap[type]?.[event]?.[access].includes(permission);

    //Log('access', ctx.__permission, event, access, type, accessMap[type]?.[event]?.[access], valid)

    return valid;
}

async function backDestroy(ctx: ContextSchema, more: MoreSchema) {
    const promises: ResponseSchema[] = [];
    more.savedlist.forEach((saved) => {
        const p = saved.controller[saved.volatile ? "delete" : "destroy"]({
            ...ctx,
            data: {
                id: saved.modelId,
                __key: saved.__key,
            },
        });
        return promises.push(p);
    });
    const log = await Promise.allSettled(promises);
    //Log('backDestroy', more, log)
    more.savedlist = [];
    return;
}

export { MakeCtlForm };
