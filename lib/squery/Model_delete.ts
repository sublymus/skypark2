import STATUS from "./Errors/STATUS";
import { FileValidator } from "./FileManager";
import { DescriptionSchema, EventPostSchema, EventPreSchema, ModelInstanceSchema, ModelOptionInterface, MoreSchema, ResponseSchema, ResultSchema } from "./Initialize";
import { ContextSchema } from "./Context";
import { ModelController } from "./SQuery_ModelController";
import { Local } from "./SQuery_init";

export const deleteFactory = (
    controller: ModelController,
    callPost: (e: EventPostSchema) => ResponseSchema,
    callPre: (e: EventPreSchema) => Promise<void | ResultSchema>
  ) => {
    return async (
        ctx: ContextSchema,
        more?: MoreSchema
    ): ResponseSchema => {
        const service =  "delete";
        ctx = { ...ctx };
        ctx.service = service;
        ctx.ctrlName = controller.name;
        if (!more) more = {};
        if (!more.savedlist) more.savedlist = [];
        more.__parentModel = "";
        more.modelPath = controller.name;

        // if (!accessValidator({
        //     ctx,
        //     rule: option,
        //     type: "controller"
        // })) {
        //     return await callPost({
        //         ctx,
        //         more,
        //         res: {
        //             error: "BAD_AUTH_CONTROLLER",
        //             ...(await STATUS.BAD_AUTH(ctx, {
        //                 target: controller.name.toLocaleUpperCase(),
        //             })),
        //         },
        //     });
        // }
        const preRes = await callPre({
            ctx,
            more,
        });
        if (preRes) return preRes
        let modelInstance: ModelInstanceSchema|null|undefined;
        const description: DescriptionSchema = controller.model.schema.description;
        try {
            modelInstance = await controller.model.findOne({
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
                            target: controller.name.toLocaleUpperCase(),
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
                        const ctrl = Local.ModelControllers[rule.ref];
                        const res = await ctrl?.services.delete({
                            ...ctx,
                            data: {
                                __key: ctx.__key,
                                id: modelInstance[p],
                            },
                        });
                        if (!res?.response) {
                            //////// tres important ///////////
                        }
                    } else if (Array.isArray(rule) && rule[0].ref) {
                        for (let i = 0; i < modelInstance[p].length; i++) {
                            const ctrl = Local.ModelControllers[rule[0].ref];
                            const res = await ctrl?.services.delete ({
                                ...ctx,
                                data: {
                                    ...ctx.data,
                                    id: modelInstance[p][i],
                                },
                            });
                        }
                        const res = await Local.ModelControllers[rule[0].ref]?.services.list?.({
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
                                    modelPath: controller.name,
                                    id: ctx.data.id,
                                    property: p
                                }
                            );
                        } catch (error:any) {
                            return await callPost({
                                ctx,
                                more,
                                res: {
                                    error: "FILE_REMOVE_ERROR",
                                    ...(await STATUS.NOT_FOUND(ctx, {
                                        target: controller.name.toLocaleUpperCase(),
                                        message: error.message,
                                    })),
                                },
                            });
                        }
                    }
                }
            }
        } catch (error:any) {
            return await callPost({
                ctx,
                more,
                res: {
                    error: "DELETE_ERROR",
                    ...(await STATUS.NOT_FOUND(ctx, {
                        target: controller.name.toLocaleUpperCase(),
                        message: error.message,
                    })),
                },
            });
        }
        try {
            modelInstance.remove();
        } catch (error:any) {
            return await callPost({
                ctx,
                more,
                res: {
                    error: "NOT_DELETED",
                    ...(await STATUS.NOT_DELETED(ctx, {
                        target: controller.name.toLocaleUpperCase(),
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
                    target: controller.name.toLocaleUpperCase(),
                })),
            },
        });
    };
}