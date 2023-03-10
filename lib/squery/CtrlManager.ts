import mongoose from "mongoose";
import fs from "node:fs";
import Log from "sublymus_logger";
import STATUS from "../../App/Errors/STATUS";
import { Config } from "../../squeryconfig";
import { ContextSchema } from "./Context";
import { AloFiles, Controllers, ControllerSchema, CtrlMakerSchema, DescriptionSchema, EventPostSchema, EventPreSchema, EventSting, FileSchema, From_optionSchema, ListenerPostSchema, ListenerPreSchema, ModelInstanceSchema, MoreSchema, PopulateSchema, ResponseSchema, RestSchema, TypeRuleSchema } from "./Initialize";

// les tableau 2D sont pas tolere
const MakeModelCtlForm: (options: From_optionSchema) => CtrlMakerSchema = (options: From_optionSchema): CtrlMakerSchema => {
    console.log(options?.model?.modelName);
    const option: From_optionSchema & { modelPath: string } = {
        ...options,
        modelPath: options.model.modelName,
    }
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


        /////////////////////////////////////////////////////////////////
        ///////////////////           CREATE         ////////////////////
        /////////////////////////////////////////////////////////////////
        controller[option.volatile ? "create" : "store"] = async (
            ctx,
            more
        ): ResponseSchema => {
            const event = option.volatile ? "create" : "store";
            if (!accessValidator(ctx, event, option.access, "controller")) {
                return callPost({
                    ctx,
                    more: { ...more },
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
                more: { ...more },
                event,
            });
            const modelId = new mongoose.Types.ObjectId().toString();
            const description = option.schema.obj;
            if (!more) {
                more = {};
                more.savedlist = [];
                more.__parentModel = '';
            }
            const accu = {};
            let modelInstance: ModelInstanceSchema;
            if (!ctx.__key) ctx.__key = new mongoose.Types.ObjectId().toString(); ///// cle d'auth
            Log('**************', ctx.description)
            for (const property in description) {
                if (Object.prototype.hasOwnProperty.call(description, property) && ctx.data[property] != undefined) {
                    const rule = description[property];
                    Log('log2', { property, value: ctx.data[property], modelPath: option.modelPath })
                    if (rule.ref) {
                        const ctrl = Controllers[rule.ref]();
                        Log('log', { property, value: ctx.data[property], modelPath: option.modelPath })
                        const res = await (ctrl.create || ctrl.store)(
                            {
                                ...ctx,
                                data: {
                                    ...ctx.data[property],
                                },
                            },
                            {
                                ...more,
                                __parentModel: option.modelPath + '_' + modelId + '_' + property,
                            }
                        );
                        Log('log', { res, property, value: ctx.data[property], modelPath: option.modelPath })
                        if (!res) {
                            more.modelPath = option.modelPath;
                            await backDestroy(ctx, more);
                            // Log('log', { res })
                            return callPost({
                                ctx,
                                more: { ...more },
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
                                more: { ...more },
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
                                {
                                    ...more,
                                    __parentModel: option.modelPath + '_' + modelId + '_' + property,
                                }
                            );
                            // Log('log', { res, property, value: ctx.data[property][i], modelPath: option.modelPath })
                            if (!res) {
                                more.modelPath = option.modelPath;
                                await backDestroy(ctx, more);
                                //Log('log', { res })
                                return callPost({
                                    ctx,
                                    more: { ...more },
                                    event,
                                    res,
                                });
                            }
                            if (res.error) {
                                more.modelPath = option.modelPath;
                                await backDestroy(ctx, more);
                                return callPost({
                                    ctx,
                                    more: { ...more },
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
                                more: { ...more },
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
            accu["__parentModel"] = more.__parentModel;
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
                    more: { ...more },
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
                more: { ...more, modelInstance },
                event,
                res: {
                    response: modelId,
                    ...(await STATUS.CREATED(ctx, {
                        target: option.modelPath.toLocaleUpperCase(),
                    })),
                },
            });
        };
        /////////////////////////////////////////////////////////////////
        ///////////////////            READ          ////////////////////
        /////////////////////////////////////////////////////////////////
        controller["read"] = async (ctx, more): ResponseSchema => {
            const event = "read";
            if (!accessValidator(ctx, event, option.access, "controller")) {
                return callPost({
                    ctx,
                    more: { ...more },
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
                more: { ...more },
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
                        more: { ...more, modelInstance },
                        event,
                        res: {
                            error: "NOT_FOUND",
                            ...(await STATUS.NOT_FOUND(ctx, {
                                target: option.modelPath.toLocaleUpperCase(),
                            })),
                        },
                    });
                }
                await formatModelInstance(ctx, event, option, modelInstance);
                //await modelInstance.select(i)
            } catch (error) {
                return callPost({
                    ctx,
                    more: { ...more, modelInstance },
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
            return callPost({
                ctx,
                more: { ...more, modelInstance },
                event,
                res: {
                    response: modelInstance,
                    ...(await STATUS.OPERATION_SUCCESS(ctx, {
                        target: option.modelPath.toLocaleUpperCase(),
                    })),
                },
            });
        };

        /////////////////////////////////////////////////////////////////
        ///////////////////            LIST          ////////////////////
        /////////////////////////////////////////////////////////////////
        controller["list"] = async (ctx, more): ResponseSchema => {
            const event = "list";
            if (!accessValidator(ctx, event, option.access, "controller")) {
                return callPost({
                    ctx,
                    more: { ...more },
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
                more: { ...more },
                event,
            });
            const { paging, addId, addNew, remove, property } = ctx.data;
            let parentModelInstance: ModelInstanceSchema;
            more = {
                savedlist: [],
                ...more,
                __parentModel: paging?.query?.__parentModel,
            };

            const parts = more.__parentModel?.split('_');
            const parentPath = parts?.[0];
            const parentId = parts?.[1];
            const parentProperty = parts?.[2];
            if (!more.__parentModel || !parentPath || !parentId || !parentProperty) {
                return callPost({
                    ctx,
                    more: { ...more },
                    event,
                    res: {
                        error: "ILLEGAL_ARGUMENT",
                        ...(await STATUS.OPERATION_FAILED(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                            message: '__parentModel must be defined: <parentModelPath>_<parentId>_<parentProperty>',
                        })),
                    },
                });
            }

            try {
                parentModelInstance = await Controllers[parentPath].option.model.findOne({
                    _id: parentId,
                });
                if (!parentModelInstance) {
                    return callPost({
                        ctx,
                        more: { ...more },
                        event,
                        res: {
                            error: "NOT_FOUND",
                            ...(await STATUS.NOT_FOUND(ctx, {
                                target: parentPath.toLocaleUpperCase(),
                            })),
                        },
                    });
                }
            } catch (error) {
                return callPost({
                    ctx,
                    more: { ...more },
                    event,
                    res: {
                        error: "NOT_FOUND",
                        ...(await STATUS.NOT_FOUND(ctx, {
                            target: parentPath.toLocaleUpperCase(),
                            message: error.message,
                        })),
                    },
                });
            }
            const isParentUser = parentModelInstance.__key._id.toString() == ctx.__key
            if (accessValidator(ctx, 'update', option.access, "property", isParentUser)) {
                let validAddId = []
                let validAddNew = []
                /***********************  AddId  ****************** */
                if (Array.isArray(addId)) {
                    const promises = addId.map((id) => {
                        return new Promise<string>(async (rev, rej) => {
                            try {
                                const modelInstance = await option.model.findOne({
                                    _id: id,
                                });
                                if (!modelInstance) {
                                    return rej(null);
                                }
                                const parts = modelInstance.__parentModel.split('_');
                                const parentPath = parts[0];
                                const parentId = parts[1];
                                const parentProperty = parts[2];
                                const description = Controllers[parentPath]?.option.schema.obj;
                                if (!description) {
                                    return rej(null);
                                }
                                let rule = description[parentProperty];
                                rule = Array.isArray(rule) ? rule[0] : rule;
                                if (parentModelInstance[parentProperty].includes(modelInstance._id.toString())) {
                                    Log('duplication', 'not provide')
                                    return rej(null);
                                }
                                const isItemUser = modelInstance.__key._id.toString() == ctx.__key
                                if (!accessValidator(ctx, 'update', rule.access, "property", isItemUser)) {
                                    return rej(null);
                                }
                                rev(id);
                            } catch (error) {
                                rej(null);
                            }
                        });
                    });
                    const result = await Promise.allSettled(promises);
                    const validResult = result.filter((data: any) => {
                        return !!data.value;
                    }).map((data: any) => {
                        return data.value;
                    })
                    validAddId.push(...validResult);
                }
                /***********************  AddNew  ****************** */
                if (Array.isArray(addNew)) {
                    const ctrl = Controllers[option.modelPath]();
                    more.__parentModel = paging?.query?.__parentModel;
                    const promises = addNew.map((data) => {
                        return new Promise(async (rev, rej) => {
                            if (!more.__parentModel) rej(null);
                            const res = await (ctrl.create || ctrl.store)(
                                {
                                    ...ctx,
                                    data,
                                }, more
                            );
                            if (res.error) rej(null)
                            else rev(res.response);
                        });
                    });
                    const result = await Promise.allSettled(promises);
                    const validResult = result.filter((data: any) => {
                        return !!data.value;
                    }).map((data: any) => {
                        return data.value;
                    })
                    validAddNew.push(...validResult);
                }
                if (validAddId.length > 0 || validAddNew.length > 0) {
                    try {
                        parentModelInstance[property].push(...validAddId, ...validAddNew);
                        await parentModelInstance.save();
                    } catch (error) {
                        await backDestroy(ctx, more);
                        return callPost({
                            ctx,
                            more: { ...more },
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
                }
                /***********************  remove  ****************** */
                if (remove) {
                    parentModelInstance[parentProperty] = parentModelInstance[parentProperty].filter((id) => {
                        return !remove.includes(id.toString());
                    })
                }

                try {
                    parentModelInstance.save();
                    // remove.
                } catch (error) {
                    await backDestroy(ctx, more);
                    return callPost({
                        ctx,
                        more: { ...more },
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
            } else {
                Log('wertyuiop', 'wer54t67u8io9')
            }
            Log('parent', parentModelInstance);
            const defaultPaging = {
                page: 1,
                limit: 20,
                lean: false,
                sort: {},
                select: '',
            }
            const myCustomLabels = {
                totalDocs: 'totalItems',
                docs: 'items',
            };

            const options: any = {
                page: paging.page || defaultPaging.page,
                limit: paging.limit || defaultPaging.limit,
                lean: defaultPaging.lean,
                sort: paging.sort || defaultPaging.sort,
                select: paging.select || defaultPaging.select,
                populate: false,
                customLabels: myCustomLabels,
            };

            let result = null;
            try {
                result = await Controllers[option.modelPath].option.model.paginate(paging.query, options);
                if (!result) {

                }
                const promise = result.items.map((item) => {
                    return formatModelInstance(ctx, event, option, item);
                });
                await Promise.allSettled(promise)
            } catch (error) {
                return {
                    error: "OPERATION_FAILED",
                    status: 404,
                    code: "OPERATION_FAILED",
                    message: error.message,
                };
            }
            return callPost({
                ctx,
                more: { ...more, },
                event,
                res: {
                    response: result,
                    ...(await STATUS.OPERATION_SUCCESS(ctx, {
                        target: option.modelPath.toLocaleUpperCase(),
                    })),
                },
            });
        };

        /////////////////////////////////////////////////////////////////
        ///////////////////           UPDATE         ////////////////////
        /////////////////////////////////////////////////////////////////
        controller["update"] = async (ctx, more): ResponseSchema => {
            const event = "update";
            if (!accessValidator(ctx, event, option.access, "controller")) {
                return callPost({
                    ctx,
                    more: { ...more },
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
                more: { ...more },
                event,
            });

            let modelInstance: ModelInstanceSchema;
            const description: DescriptionSchema = option.schema.obj;

            try {
                modelInstance = await option.model.findOne({
                    _id: ctx.data.id,
                });
                if (!modelInstance) {
                    return callPost({
                        ctx,
                        more: { ...more, modelInstance },
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
                        if (!Array.isArray(rule) && rule.ref) {
                            continue
                        }
                        if (Array.isArray(rule)) {
                            if (rule[0].ref) {
                                /***
                             * 
                             *   const folders =   await instance.folders
                             *      const indexes = [];
                             *      
                             *       folders.forEach((value , index)=>{
                    *                  if( value.expireAt < Date.now()){
                    *                       indexes.push(index)
                    *                  }
                             *               
                             *      })
                             * 
                             *  instance.folders = {
                             *                  add:['idjkuhjd','idkjghjksac'],
                             *                  remove: [34, 79, 98]
                             *               }
                             * 
                             * 
                             * 
                             * 
                             * 
                             */
                            } else if (rule[0].file) {
                                try {
                                    modelInstance[p] = await FileValidator(
                                        ctx,
                                        event,
                                        rule[0],
                                        ctx.data[p],
                                        modelInstance[p]
                                    );
                                } catch (error) {
                                    return callPost({
                                        ctx,
                                        more: { ...more, modelInstance },
                                        event,
                                        res: {
                                            error: "UPLOAD_ERROR",
                                            ...(await STATUS.OPERATION_FAILED(ctx, {
                                                target: option.modelPath.toLocaleUpperCase(),
                                                message: error.message,
                                            })),
                                        },
                                    });
                                }
                            } else {
                                modelInstance[p] = ctx.data[p];
                            }
                        } else {
                            modelInstance[p] = ctx.data[p];
                        }
                    }
                }
            } catch (error) {
                return callPost({
                    ctx,
                    more: { ...more, modelInstance },
                    event,
                    res: {
                        error: "OPERATION_FAILED",
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
                    more: { ...more, modelInstance },
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
                more: { ...more, modelInstance },
                event,
                res: {
                    response: (await controller.read(ctx)).response,
                    ...(await STATUS.OPERATION_SUCCESS(ctx, {
                        target: option.modelPath.toLocaleUpperCase(),
                    })),
                },
            });
        };

        /////////////////////////////////////////////////////////////////
        ///////////////////          DELETE          ////////////////////
        /////////////////////////////////////////////////////////////////
        controller[option.volatile ? "delete" : "destroy"] = async (
            ctx,
            more
        ): ResponseSchema => {
            const event = option.volatile ? "delete" : "destroy";
            if (!accessValidator(ctx, event, option.access, "controller")) {
                return callPost({
                    ctx,
                    more: { ...more },
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
                more: { ...more },
                event,
            });
            let modelInstance: ModelInstanceSchema;
            const description: DescriptionSchema = option.schema.obj;
            try {
                modelInstance = await option.model.findOne({
                    _id: ctx.data.id,
                    __key: ctx.__key,
                });
                if (!modelInstance) {
                    return callPost({
                        ctx,
                        more: { ...more, modelInstance },
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
                        if (!Array.isArray(rule) && rule.ref) {
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
                                    more: { ...more, modelInstance },
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
                        }
                    }
                }
            } catch (error) {
                return callPost({
                    ctx,
                    more: { ...more, modelInstance },
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
                modelInstance.remove();
            } catch (error) {
                return callPost({
                    ctx,
                    more: { ...more, modelInstance },
                    event,
                    res: {
                        error: "NOT_DELETED",
                        ...(await STATUS.NOT_DELETED(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                            message: error.message,
                            /////////////////    super important  //////////////////////
                        })),
                    },
                });
            }

            return callPost({
                ctx,
                more: { ...more, modelInstance },
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


async function formatModelInstance(ctx: ContextSchema, event: EventSting, option: From_optionSchema & { modelPath: string; }, modelInstance: ModelInstanceSchema) {
    const info: PopulateSchema = {};
    deepPopulate(
        ctx,
        event,
        option.model.modelName,
        info,
        modelInstance.__key._id.toString() == ctx.__key
    );
    await modelInstance.populate(info.populate);
    const propertys = info.select.replaceAll(" ", "").split("-");
    propertys.forEach((p) => {
        modelInstance[p] = undefined;
    });
}

function deepPopulate(
    ctx: ContextSchema,
    event: EventSting,
    ref: string,
    info: PopulateSchema,
    isUser?: boolean
) {
    const description: DescriptionSchema = Controllers[ref].option.schema.obj;
    info.populate = [];
    info.select = "";
    for (const p in description) {
        if (Object.prototype.hasOwnProperty.call(description, p)) {
            const rule = description[p];

            // Log('yes....', ref, p)
            const exec = (rule: TypeRuleSchema) => {
                if (rule.populate == true) {
                    const info2 = {
                        path: p,
                    };
                    info.populate.push(info2);
                    deepPopulate(ctx, event, rule.ref, info2, isUser);
                }
            };
            if (!Array.isArray(rule)) {
                if (!accessValidator(ctx, event, rule.access, "property", isUser)) {
                    info.select = info.select + " -" + p;
                    continue;
                }
                if (rule.ref) exec(rule);
            } else if (Array.isArray(rule) && rule[0].ref) {
                if (!accessValidator(ctx, event, rule[0].access, "property", isUser)) {
                    info.select = info.select + " -" + p;
                    continue;
                }
                exec(rule[0]);
            }
        }
    }
    return;
}



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
    return valide;
}
async function FileValidator(
    ctx: ContextSchema,
    event: EventSting,
    rule: TypeRuleSchema,
    files: FileSchema[],
    actualPaths?: string[]
): Promise<string[]> {
    if (["create", "store", "update"].includes(event)) {
        if (!files) return;
        rule.file.type = rule.file.type || ["*/*"];
        rule.file.type = rule.file.type.length == 0 ? ["*/*"] : rule.file.type;
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

                paths.push(path.replace(Config.rootDir, ''));
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
                paths.push(path.replace(Config.rootDir, ''));
            });
            Log("paths", "created", paths);
            actualPaths.forEach((actualPath) => {
                if (fs.existsSync(Config.rootDir + actualPath)) {
                    fs.unlink(Config.rootDir + actualPath, (err) => {
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
                if (fs.existsSync(Config.rootDir + actualPath)) {
                    fs.unlink(Config.rootDir + actualPath, (err) => {
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
            list: {
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
            list: {
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

export { MakeModelCtlForm };




/*

const sendBtn = _('button','send-code','SEND CODE');


Squery,socket.emit('signup:user',data,(res)=>{
    this.
},(res)=>{
    if(res.error) return alert(res);

    sendBtn.addEventListener('click',()=>{
        res.response.callBack($('.code-input').value);
    })
})



*/