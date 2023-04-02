import mongoose from "mongoose";
import fs from "node:fs";
import Log from "sublymus_logger";
import STATUS from "../../App/Errors/STATUS";
import { Config } from "../../squeryconfig";
import { ContextSchema } from "./Context";
import { CtrlModelMakerSchema, DescriptionSchema, EventPostSchema, EventPreSchema, FileSchema, ListenerPostSchema, ListenerPreSchema, ModelActionAvailable, ModelControllers, ModelControllerSchema, ModelFrom_optionSchema, ModelInstanceSchema, MoreSchema, PopulateSchema, ResponseSchema, ResultSchema, TypeRuleSchema } from "./Initialize";

// les tableau 2D sont pas tolere
const MakeModelCtlForm: (options: ModelFrom_optionSchema) => CtrlModelMakerSchema = (options: ModelFrom_optionSchema): CtrlModelMakerSchema => {
    // //console.log(options?.model?.modelName);
    const option: ModelFrom_optionSchema & { modelPath: string } = {
        ...options,
        modelPath: options.model.modelName,
    }
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
        Log("post", option.modelPath, e.res);
        if (!(EventManager[e.action]?.post)) return e.res;

        for (const listener of EventManager[e.action].post) {
            if (listener) await listener(e);
        }

        return e.res;
    };
    const ctrlMaker = function () {
        const controller: ModelControllerSchema = {};

        const validId = async ({ id, modelPath }) => {

            const local_modelInstance = await ModelControllers[modelPath].option.model.findOne({
                _id: id
            });
            if (!local_modelInstance) {
                Log('local_modelInstance : ', local_modelInstance)
                throw new Error("Id not found; modePath:" + option.modelPath + "; alienId:" + id + "; alienModelPath:" + modelPath);
            }
            return true;
        }

        /////////////////////////////////////////////////////////////////
        ///////////////////           CREATE         ////////////////////
        /////////////////////////////////////////////////////////////////
        controller[option.volatile ? "create" : "store"] = async (
            ctx: ContextSchema,
            more: MoreSchema
        ): ResponseSchema => {
            const action = option.volatile ? "create" : "store";
            if (!accessValidator(ctx, action, option.access, "controller")) {
                return await callPost({
                    ctx,
                    more: { ...more },
                    action,
                    res: {
                        error: "BAD_AUTH_CONTROLLER",
                        ...(await STATUS.BAD_AUTH(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            await callPre({
                ctx,
                more: { ...more },
                action,
            });
            const modelId = new mongoose.Types.ObjectId().toString();
            const description: DescriptionSchema = option.schema.description;
            if (!more) {
                more = {};
                more.savedlist = [];
                more.__parentModel = '';
            }

            const accu = {};
            let modelInstance: ModelInstanceSchema;
            if (!ctx.__key) ctx.__key = new mongoose.Types.ObjectId().toString(); ///// cle d'auth
            for (const property in description) {
                if (Object.prototype.hasOwnProperty.call(description, property) && ctx.data[property] != undefined) {
                    const rule = description[property];
                    //Log('log2', { property, value: ctx.data[property], modelPath: option.modelPath })
                    if (!Array.isArray(rule) && rule.ref) {
                        const isStr = typeof ctx.data[property] == 'string';
                        const isAlien = !!(rule.alien || rule.strictAlien);
                        Log('alien', 'strictAlien: ', !!rule.strictAlien, 'isStr: ', isStr, option.modelPath, 'result: ', (!!rule.strictAlien) && !isStr)
                        if (!isAlien && isStr) {
                            return await callPost({
                                ctx,
                                more: { ...more },
                                action,
                                res: {
                                    error: "ILLEGAL_ARGUMENT",
                                    status: 404,
                                    code: "ILLEGAL_ARGUMENT",
                                    message: 'the property not a alien.. ; value must be creation data object;' + 'model_<' + option.modelPath + '>:<' + action + '> , can not create child :<' + property + '>, ref = <' + rule.ref + '> with id : <' + ctx.data[property] + ">",
                                },
                            });
                        } else if (isAlien && isStr) {
                            try {
                                const alienId = ctx.data[property];
                                if (await validId({
                                    id: alienId,
                                    modelPath: rule.ref
                                })) {
                                    accu[property] = alienId;
                                }
                            } catch (error) {
                                return await callPost({
                                    ctx,
                                    more: { ...more },
                                    action,
                                    res: {
                                        error: "ILLEGAL_ARGUMENT",
                                        status: 404,
                                        code: "ILLEGAL_ARGUMENT",
                                        message: 'model_<' + option.modelPath + '>:<' + action + '> , can not create child :<' + property + '>, ref = <' + rule.ref + '> with id : <' + ctx.data[property] + ">",
                                    },
                                });
                            }
                            continue
                        } else if ((!!rule.strictAlien) && !isStr) {
                            return await callPost({
                                ctx,
                                more: { ...more },
                                action,
                                res: {
                                    error: "ILLEGAL_ARGUMENT",
                                    status: 404,
                                    code: "ILLEGAL_ARGUMENT",
                                    message: 'the property strictAlien.. ; value must be id;' + 'model_<' + option.modelPath + '>:<' + action + '> , can not create child :<' + property + '>, ref = <' + rule.ref + '> with id : <' + ctx.data[property] + ">",
                                },
                            });
                        }
                        const ctrl = ModelControllers[rule.ref]();
                        // Log('log', { property, value: ctx.data[property], modelPath: option.modelPath })
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
                        if (!res) {
                            // Log('log', { res, property, value: ctx.data[property], modelPath: option.modelPath })
                            more.modelPath = option.modelPath;
                            await backDestroy(ctx, more);
                            // Log('log', { res })
                            return await callPost({
                                ctx,
                                more: { ...more },
                                action,
                                res: {
                                    error: "ACCESS_NOT_FOUND",
                                    status: 404,
                                    code: "ACCESS_NOT_FOUND",
                                    message: 'model_<' + option.modelPath + '>:<' + action + '> , can not create child :<' + property + '>, ref = <' + rule.ref + '> with id : <' + ctx.data[property] + ">",
                                },
                            });
                        }
                        if (res.error) {
                            more.modelPath = option.modelPath;
                            await backDestroy(ctx, more);
                            return await callPost({
                                ctx,
                                more: { ...more },
                                action,
                                res,
                            });
                        }
                        accu[property] = res.response;
                    } else if (Array.isArray(rule) && rule[0].ref) {
                        ctx.data[property] = Array.isArray(ctx.data[property])
                            ? ctx.data[property]
                            : [];
                        accu[property] = [];
                        const ctrl = ModelControllers[rule[0].ref]();
                        for (let i = 0; i < ctx.data[property].length; i++) {
                            //Log('******', { property }, ' = ', accu[property][i], ' value = ', ctx.data[property][i]);
                            // Log('info', 'alien = ', rule[0].alien, ' if ', (rule[0].alien && typeof ctx.data[property][i] == 'string'))
                            const isStr = typeof ctx.data[property][i] == 'string';
                            const isAlien = !!(rule[0].alien || rule[0].strictAlien);
                            Log('alien', 'strictAlien: ', !!rule[0].strictAlien, 'isStr: ', isStr, option.modelPath, 'result: ', (!!rule[0].strictAlien) && !isStr)
                            if (!isAlien && isStr) {
                                return await callPost({
                                    ctx,
                                    more: { ...more },
                                    action,
                                    res: {
                                        error: "ILLEGAL_ARGUMENT",
                                        status: 404,
                                        code: "ILLEGAL_ARGUMENT",
                                        message: 'the property not a alien.. ; value must be creation data object;' + 'model_<' + option.modelPath + '>:<' + action + '> , can not create child :<' + property + '>, ref = <' + rule[0].ref + '> with id : <' + ctx.data[property][i] + ">",
                                    },
                                });
                            } else if (isAlien && isStr) {
                                try {
                                    const alienId = ctx.data[property][i];
                                    if (await validId({
                                        id: alienId,
                                        modelPath: rule[0].ref
                                    })) {
                                        accu[property][i] = alienId;
                                    }
                                } catch (error) {
                                    return await callPost({
                                        ctx,
                                        more: { ...more },
                                        action,
                                        res: {
                                            error: "ILLEGAL_ARGUMENT",
                                            status: 404,
                                            code: "ILLEGAL_ARGUMENT",
                                            message: 'model_<' + option.modelPath + '>:<' + action + '> , can not create child :<' + property + '>, ref = <' + rule[0].ref + '> with id : <' + ctx.data[property][i] + ">",
                                        },
                                    });
                                }
                                continue
                            } else if ((!!rule[0].strictAlien) && !isStr) {
                                return await callPost({
                                    ctx,
                                    more: { ...more },
                                    action,
                                    res: {
                                        error: "ILLEGAL_ARGUMENT",
                                        status: 404,
                                        code: "ILLEGAL_ARGUMENT",
                                        message: 'the property strictAlien.. ; value must be id;' + 'model_<' + option.modelPath + '>:<' + action + '> , can not create child :<' + property + '>, ref = <' + rule[0].ref + '> with id : <' + ctx.data[property][i] + ">",
                                    },
                                });
                            }
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
                                return await callPost({
                                    ctx,
                                    more: { ...more },
                                    action,
                                    res,
                                });
                            }
                            if (res.error) {
                                more.modelPath = option.modelPath;
                                await backDestroy(ctx, more);
                                return await callPost({
                                    ctx,
                                    more: { ...more },
                                    action,
                                    res,
                                });
                            }
                            accu[property][i] = res.response;
                        }
                    } else if (Array.isArray(rule) && rule[0].file && ctx.data[property]) {
                        // accu[property] = await FileValidator(ctx, action, rule[0], ctx.data[property])
                        Log('File', ctx.data[property])
                        try {
                            accu[property] = await FileValidator(
                                ctx,
                                action,
                                rule[0],
                                ctx.data[property],
                            );
                        } catch (error) {
                            await backDestroy(ctx, more);
                            return await callPost({
                                ctx,
                                more: { ...more },
                                action,
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
                return await callPost({
                    ctx,
                    more: { ...more },
                    action,
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

            return await callPost({
                ctx,
                more: { ...more, modelInstance },
                action,
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
            const action = "read";


            //Log('auth', { ctx, action, access: option.access, "controller": "" })
            if (!accessValidator(ctx, action, option.access, "controller")) {
                return await callPost({
                    ctx,
                    more: { ...more },
                    action,
                    res: {
                        error: "BAD_AUTH_CONTROLLER",
                        ...(await STATUS.BAD_AUTH(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            await callPre({
                ctx,
                more: { ...more },
                action,
            });
            let modelInstance: ModelInstanceSchema;
            try {
                modelInstance = await option.model.findOne({
                    _id: ctx.data.id,
                });
                //Log('__permission', ctx.__permission, '__key', ctx.__key, 'instance__key', modelInstance.__key);
                if (!modelInstance) {
                    return await callPost({
                        ctx,
                        more: { ...more, modelInstance },
                        action,
                        res: {
                            error: "NOT_FOUND",
                            ...(await STATUS.NOT_FOUND(ctx, {
                                target: option.modelPath.toLocaleUpperCase(),
                                message: 'modelInstance is null, ' + ctx.data.id
                            })),
                        },
                    });
                }
                //Log('aboutAccessRead', { ctx, action, option, modelInstance })
                await formatModelInstance(ctx, action, option, modelInstance);
                //await modelInstance.select(i)
            } catch (error) {
                return await callPost({
                    ctx,
                    more: { ...more, modelInstance },
                    action,
                    res: {
                        error: "NOT_FOUND",
                        ...(await STATUS.NOT_FOUND(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                            message: error.message,
                        })),
                    },
                });
            }
            return await callPost({
                ctx,
                more: { ...more, modelInstance },
                action,
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
            const action = "list";
            if (!accessValidator(ctx, action, option.access, "controller")) {
                return await callPost({
                    ctx,
                    more: { ...more },
                    action,
                    res: {
                        error: "BAD_AUTH_CONTROLLER",
                        ...(await STATUS.BAD_AUTH(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            await callPre({
                ctx,
                more: { ...more },
                action,
            });
            const { paging, addNew, addId, remove, property } = ctx.data;
            let parentModelInstance: ModelInstanceSchema;
            more = {
                savedlist: [],
                ...more,
                __parentModel: paging?.query?.__parentModel,
            };
            //   Log('remove', { remove })
            const parts = more.__parentModel?.split('_');
            const parentModelPath = parts?.[0];
            const parentId = parts?.[1];
            const parentProperty = parts?.[2];
            if (!more.__parentModel || !parentModelPath || !parentId || !parentProperty) {
                return await callPost({
                    ctx,
                    more: { ...more },
                    action,
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
                parentModelInstance = await ModelControllers[parentModelPath].option.model.findOne({
                    _id: parentId,
                });
                if (!parentModelInstance) {
                    throw new Error('parentModelInstance is undefined, using {id:' + parentId + ", modelPath:" + parentModelPath + "}");
                }
            } catch (error) {
                return await callPost({
                    ctx,
                    more: { ...more },
                    action,
                    res: {
                        error: "NOT_FOUND",
                        ...(await STATUS.NOT_FOUND(ctx, {
                            target: parentModelPath.toLocaleUpperCase(),
                            message: error.message,
                        })),
                    },
                });
            }
            const parentDescription = ModelControllers[parentModelPath].option.schema.description
            let parentPropertyRule = parentDescription[parentProperty];
            if (!Array.isArray(parentPropertyRule)) return await callPost({
                ctx,
                more: { ...more, },
                action,
                res: {
                    error: "OPERATION_FAILED",
                    status: 404,
                    code: "OPERATION_FAILED",
                    message: " property <" + property + "> is not an array"
                },
            });
            parentPropertyRule = parentPropertyRule[0];

            const isParentUser = parentModelInstance.__key._id.toString() == ctx.__key
            if (accessValidator(ctx, 'update', parentPropertyRule.access, "property", isParentUser)) {
                let validAddId = []
                let validAddNew = []
                /***********************  AddId  ****************** */
                const isAlien = !!(parentPropertyRule.alien || parentPropertyRule.strictAlien);
                Log("isAlien", isAlien)
                if (Array.isArray(addId) && isAlien) {
                    Log('Je_peux_ajouter_dans_la_list', true)
                    const promises = addId.map((id) => {
                        return new Promise<string>(async (rev, rej) => {
                            try {
                                await validId({
                                    id,
                                    modelPath: option.modelPath
                                })

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
                Log("strictAlien", parentPropertyRule.strictAlien);
                if (Array.isArray(addNew) && parentPropertyRule.strictAlien != true) {
                    Log('Je_peux_cree_dans_la_list', true)
                    const ctrl = ModelControllers[option.modelPath]();
                    more.__parentModel = paging?.query?.__parentModel;
                    const promises = addNew.map((data) => {
                        return new Promise(async (rev, rej) => {
                            if (!more.__parentModel) rej(null);
                            const res = await ctrl.create(
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

                /***********************  remove : in DB - > in List ****************** */
                try {
                    Log('try', { remove, parentProperty });
                    if (Array.isArray(remove)) {
                        for (const id of remove) {
                            const impact = parentPropertyRule.impact != false;
                            let res: ResultSchema;
                            Log('impact', { impact, parentProperty, parentPropertyRule });
                            if (impact) {
                                res = await ModelControllers[option.modelPath]().delete(
                                    {
                                        ...ctx,
                                        data: { id },
                                    }, more
                                );
                                Log('List_remove_res', res);
                                if (res.error) continue;
                            }
                            parentModelInstance[parentProperty] = parentModelInstance[parentProperty].filter((some_id: string) => {
                                return !(some_id == id)
                            })
                        }
                    }
                } catch (error) {
                    await backDestroy(ctx, more);
                    return await callPost({
                        ctx,
                        more: { ...more },
                        action,
                        res: {
                            error: "OPERATION_FAILED",
                            ...(await STATUS.OPERATION_FAILED(ctx, {
                                target: option.modelPath.toLocaleUpperCase(),
                                message: error.message,
                            })),
                        },
                    });
                }
                if (validAddNew.length > 0 || (Array.isArray(remove) && remove.length > 0)) {
                    try {
                        parentModelInstance[property].push(...validAddNew);
                        await parentModelInstance.save();
                    } catch (error) {
                        await backDestroy(ctx, more);
                        return await callPost({
                            ctx,
                            more: { ...more },
                            action,
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

            } else {
                Log('AccesRefuse', 'update List')
            }
            Log('parent', parentModelInstance);
            if (!accessValidator(ctx, 'read', parentPropertyRule.access, "property", isParentUser)) return await callPost({
                ctx,
                more: { ...more, },
                action,
                res: {
                    error: "OPERATION_FAILED",
                    status: 404,
                    code: "OPERATION_FAILED",
                    message: "access refused for property <" + property + "> , mothod <read>"
                },
            });
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
                result = await ModelControllers[option.modelPath].option.model.paginate({
                    '_id': {
                        '$in': parentModelInstance[parentProperty],
                    }
                }, options);
                if (!result) {

                }
                const promise = result.items.map((item) => {
                    return formatModelInstance(ctx, action, option, item);
                });
                await Promise.allSettled(promise)
            } catch (error) {
                return await callPost({
                    ctx,
                    more: { ...more, },
                    action,
                    res: {
                        error: "OPERATION_FAILED",
                        status: 404,
                        code: "OPERATION_FAILED",
                        message: error.message,
                    },
                });;
            }
            return await callPost({
                ctx,
                more: { ...more, },
                action,
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
            const action = "update";
            if (!accessValidator(ctx, action, option.access, "controller")) {
                return await callPost({
                    ctx,
                    more: { ...more },
                    action,
                    res: {
                        error: "BAD_AUTH_CONTROLLER",
                        ...(await STATUS.BAD_AUTH(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            await callPre({
                ctx,
                more: { ...more },
                action,
            });

            let modelInstance: ModelInstanceSchema;
            const description: DescriptionSchema = option.schema.description;

            try {
                modelInstance = await option.model.findOne({
                    _id: ctx.data.id,
                });
                if (!modelInstance) {
                    return await callPost({
                        ctx,
                        more: { ...more, modelInstance },
                        action,
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
                        else if (!Array.isArray(rule) && rule.ref) {
                            if (!accessValidator(ctx, 'update', rule.access, "property", ctx.__key == modelInstance.__key._id.toString())) continue;

                            const isStr = typeof ctx.data[p] == 'string';
                            const isAlien = !!(rule.alien || rule.strictAlien);
                            Log('alien', 'strictAlien: ', !!rule.strictAlien, 'isStr: ', isStr, option.modelPath, 'result: ', (!!rule.strictAlien) && !isStr)
                            if (!(isAlien && isStr)) continue

                            const oldId = modelInstance[p];
                            try {
                                const alienId = ctx.data[p];
                                if (await validId({
                                    id: alienId,
                                    modelPath: rule.ref
                                })) {
                                    modelInstance[p] = alienId;
                                }
                            } catch (error) {
                                Log('Error_Ilegall_Arg_update_ref', error);
                                continue
                            }
                            try {
                                if (!await validId({
                                    id: oldId,
                                    modelPath: rule.ref
                                })) continue;

                                const impact = rule.impact != false;
                                let res: ResultSchema;
                                Log('impact', { impact, rule });
                                if (impact) {
                                    res = await ModelControllers[rule.ref]().delete({
                                        ...ctx,
                                        data: { id: oldId },
                                    }, more
                                    );
                                    Log('Error_impactRes', res);
                                }
                                continue
                            } catch (error) {
                                Log('Error_update_ref', error);
                                continue
                            }

                        }
                        else if (Array.isArray(rule)) {
                            if (!accessValidator(ctx, 'update', rule[0].access, "property", ctx.__key == modelInstance.__key._id.toString())) continue;
                            if (rule[0].ref) {
                                continue;
                            } else if (rule[0].file) {
                                try {
                                    modelInstance[p] = await FileValidator(
                                        ctx,
                                        action,
                                        rule[0],
                                        ctx.data[p],
                                        modelInstance[p]
                                    );
                                } catch (error) {
                                    return await callPost({
                                        ctx,
                                        more: { ...more, modelInstance },
                                        action,
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
                            const access = accessValidator(ctx, 'update', rule.access, "property", ctx.__key == modelInstance.__key._id.toString())
                            Log('AboutUpdateAccess', 'ctx:', ctx, '<update>', 'access:', rule.access, "<property>", "user: ", ctx.__key == modelInstance.__key._id.toString());
                            if (!access) continue;
                            modelInstance[p] = ctx.data[p];
                        }
                    }
                }
            } catch (error) {
                return await callPost({
                    ctx,
                    more: { ...more, modelInstance },
                    action,
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
                return await callPost({
                    ctx,
                    more: { ...more, modelInstance },
                    action,
                    res: {
                        error: "OPERATION_FAILED",
                        ...(await STATUS.OPERATION_FAILED(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                            message: error.message,
                        })),
                    },
                });
            }

            return await callPost({
                ctx,
                more: { ...more, modelInstance },
                action,
                res: {
                    response: (await controller.read({
                        ...ctx,
                        data: {
                            id: modelInstance._id.toString(),
                        }
                    })).response,
                    ...(await STATUS.OPERATION_SUCCESS(ctx, {
                        target: option.modelPath.toLocaleUpperCase(),
                    })),
                },
            });
        };

        //***************la supresion doit forcement bien se passer **********/
        ///////////////////          DELETE          ////////////////////
        /////////////////////////////////////////////////////////////////
        controller[option.volatile ? "delete" : "destroy"] = async (
            ctx,
            more
        ): ResponseSchema => {
            const action = option.volatile ? "delete" : "destroy";
            if (!accessValidator(ctx, action, option.access, "controller")) {
                return await callPost({
                    ctx,
                    more: { ...more },
                    action,
                    res: {
                        error: "BAD_AUTH_CONTROLLER",
                        ...(await STATUS.BAD_AUTH(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            await callPre({
                ctx,
                more: { ...more },
                action,
            });
            let modelInstance: ModelInstanceSchema;
            const description: DescriptionSchema = option.schema.description;
            try {
                modelInstance = await option.model.findOne({
                    _id: ctx.data.id,
                    __key: ctx.__key,
                });
                if (!modelInstance) {
                    return await callPost({
                        ctx,
                        more: { ...more, modelInstance },
                        action,
                        res: {
                            error: "NOT_FOUND_MODEL_INSTANCE",
                            ...(await STATUS.NOT_FOUND(ctx, {
                                target: option.modelPath.toLocaleUpperCase(),
                            })),
                        },
                    });
                }
                for (const p in description) {
                    if (Object.prototype.hasOwnProperty.call(description, p)) {
                        const rule = description[p];
                        if (!Array.isArray(rule) && rule.ref && rule.impact != false) {
                            const ctrl = ModelControllers[rule.ref]();
                            const res = await (ctrl.delete || ctrl.destroy)({
                                ...ctx,
                                data: {
                                    __key: ctx.__key,
                                    id: modelInstance[p],
                                },
                            });
                            if (res.error) {
                                //////// tres important ///////////
                            }
                        } else if (Array.isArray(rule) && rule[0].ref) {
                            // for (let i = 0; i < modelInstance[p].length; i++) {
                            //     const ctrl = ModelControllers[rule[0].ref]();
                            //     const res = await (ctrl.delete || ctrl.destroy)({
                            //         ...ctx,
                            //         data: {
                            //             ...ctx.data,
                            //             id: modelInstance[p][i],
                            //         },
                            //     });
                            // }
                            const res = await ModelControllers[rule[0].ref]().list({
                                ...ctx,
                                data: {
                                    "remove": modelInstance[p] || []
                                }
                            })
                            Log('DELET_REF[]_LIST_RES', res);
                        } else if (Array.isArray(rule) && rule[0].file) {
                            //await FileValidator(ctx, action, rule[0], ctx.data[p], modelInstance[p])
                            try {
                                const res = await FileValidator(
                                    ctx,
                                    action,
                                    rule[0],
                                    ctx.data[p],
                                    modelInstance[p]
                                );
                            } catch (error) {
                                return await callPost({
                                    ctx,
                                    more: { ...more, modelInstance },
                                    action,
                                    res: {
                                        error: "FILE_REMOVE_ERROR",
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
                return await callPost({
                    ctx,
                    more: { ...more, modelInstance },
                    action,
                    res: {
                        error: "DELETE_ERROR",
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
                return await callPost({
                    ctx,
                    more: { ...more, modelInstance },
                    action,
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

            return await callPost({
                ctx,
                more: { ...more, modelInstance },
                action,
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

    ctrlMaker.pre = (action: ModelActionAvailable, listener: ListenerPreSchema) => {
        if (!EventManager[action]) {
            EventManager[action] = {
                pre: [],
                post: [],
            };
        }
        EventManager[action].pre.push(listener);
    };
    ctrlMaker.post = (action: ModelActionAvailable, listener: ListenerPostSchema) => {
        if (!EventManager[action]) {
            EventManager[action] = {
                pre: [],
                post: [],
            };
        }
        EventManager[action].post.push(listener);
    };
    return (ModelControllers[option.modelPath] = ctrlMaker);
};


async function formatModelInstance(ctx: ContextSchema, action: ModelActionAvailable, option: ModelFrom_optionSchema & { modelPath: string; }, modelInstance: ModelInstanceSchema) {
    const info: PopulateSchema = {};
    deepPopulate(
        ctx,
        action,
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
    action: ModelActionAvailable,
    ref: string,
    info: PopulateSchema,
    isUser?: boolean
) {
    const description: DescriptionSchema = ModelControllers[ref].option.schema.description;
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
                    deepPopulate(ctx, action, rule.ref, info2, isUser);
                }
            };
            if (!Array.isArray(rule)) {
                if (!accessValidator(ctx, action, rule.access, "property", isUser)) {
                    info.select = info.select + " -" + p;
                    continue;
                }
                if (rule.ref) exec(rule);
            } else if (Array.isArray(rule) && rule[0].ref) {
                if (!accessValidator(ctx, action, rule[0].access, "property", isUser)) {
                    info.select = info.select + " -" + p;
                    continue;
                }
                exec(rule[0]);
            }
            ////console.log(info.select);

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
    action: ModelActionAvailable,
    rule: TypeRuleSchema,
    files: FileSchema[],
    actualPaths?: string[]
): Promise<string[]> {
    if (["create", "store", "update"].includes(action)) {
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
    if (action == "store") action = "create";
    else if (action == "destroy") action = "delete";

    return await Map[action]();
}
function accessValidator(
    ctx: ContextSchema,
    action: ModelActionAvailable,
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
                public: ["user", "admin", "any"],
                share: ["admin"],
                admin: ["admin"],
                secret: ["admin"],
            },
            read: {
                public: ["user", "admin", "any"],
                share: ["user", "admin"],
                admin: ["user", "admin"],
                secret: ["admin"],
            },
            list: {
                public: ["user", "admin", "any"],
                share: ["user", "admin"],
                admin: ["user", "admin"],
                secret: ["admin"],
            },
            update: {
                public: ["user", "admin", "any"],
                share: ["user", "admin"],
                admin: ["admin"],
                secret: ["admin"],
            },
            delete: {
                public: ["user", "admin", "any"],
                share: ["admin"],
                admin: ["admin"],
                secret: ["admin"],
            },
        },
        property: {
            read: {
                public: ["any", "user", "admin"],
                default: ["any", "user", "admin"],
                private: ["user", "admin"],
                admin: ["any", "user", "admin"],
                secret: ["admin"],
            },
            list: {
                public: ["any", "user", "admin"],
                default: ["any", "user", "admin"],
                private: ["user", "admin"],
                admin: ["any", "user", "admin"],
                secret: ["admin"],
            },
            update: {
                public: ["any", "user", "admin"],
                default: ["user", "admin"],
                private: ["user", "admin"],
                admin: ["admin"],
                secret: ["admin"],
            },
        },
    };
    if (action == "store") action = "create";
    else if (action == "destroy") action = "delete";

    if (type == "controller" && access == undefined) access = "public";
    if (type == "controller" && access == "private") access = "secret";

    if (type == "property" && access == undefined) access = "default";
    if (type == "property" && access == "share") access = "public";

    let permission = ctx.__permission;
    permission = permission.startsWith('user:') ? 'user' : permission
    if (permission == "user") {
        permission = isUser ? "user" : "any";
    }

    valid = accessMap[type]?.[action]?.[access].includes(permission);

    //Log('access', { permission }, { action }, { access }, { type }, { valid })

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

export { MakeModelCtlForm, accessValidator, backDestroy, FileValidator, formatModelInstance };

