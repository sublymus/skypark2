import Log from "sublymus_logger";
import { accessValidator } from "./AccessManager";
import STATUS from "./Errors/STATUS";
import { FileValidator } from "./FileManager";
import { DescriptionSchema, EventPostSchema, EventPreSchema, ModelControllerSchema, ModelControllers, ModelFrom_optionSchema, ModelInstanceSchema, MoreSchema, ResponseSchema } from "./Initialize";
import { ContextSchema } from "./Context";

export const deleteFactory = (controller: ModelControllerSchema, option: ModelFrom_optionSchema & { modelPath: string }, callPost: (e: EventPostSchema) => ResponseSchema, callPre: (e: EventPreSchema) => Promise<void>) => {
    return async (
        ctx: ContextSchema,
        more: MoreSchema
    ): ResponseSchema => {
        const service = option.volatile ? "delete" : "destroy";
        ctx = { ...ctx };
        ctx.service = service;
        ctx.ctrlName = option.modelPath;
        if (!more) more = {};
        if (!more.savedlist) more.savedlist = [];
        if (!more.signupId) more.signupId = ctx.signup?.id;
        more.__parentModel = "";
        more.modelPath = option.modelPath;

        if (!accessValidator({
            ctx,
            access: option.access,
            type: "controller"
        })) {
            return await callPost({
                ctx,
                more,
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
            more,
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
                    more,
                    res: {
                        error: "NOT_FOUND_MODEL_INSTANCE",
                        ...(await STATUS.NOT_FOUND(ctx, {
                            target: option.modelPath.toLocaleUpperCase(),
                        })),
                    },
                });
            }
            more.modelInstance = modelInstance;
            more.__parentModel = modelInstance.__parentModel;
            more.modelId = ctx.data.id;
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
                                remove: modelInstance[p] || [],
                            },
                        });
                        //Log("DELETE_REF[]_LIST_RES", res);
                    } else if (Array.isArray(rule) && rule[0].file) {
                        //await FileValidator(ctx, service, rule[0], ctx.data[p], modelInstance[p])
                        try {
                            const res = await FileValidator(
                                ctx,
                                service,
                                rule[0],
                                ctx.data[p],
                                modelInstance[p],
                                {
                                    modelPath: option.modelPath,
                                    id: ctx.data.id,
                                    property: p
                                }
                            );
                        } catch (error) {
                            return await callPost({
                                ctx,
                                more,
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
                more,
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
                more,
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
            more,
            res: {
                response: more.modelId,
                ...(await STATUS.DELETED(ctx, {
                    target: option.modelPath.toLocaleUpperCase(),
                })),
            },
        });
    };
}