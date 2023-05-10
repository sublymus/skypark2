import { accessValidator } from "./AccessManager";
import { ContextSchema } from "./Context";
import STATUS from "./Errors/STATUS";
import { EventPostSchema, EventPreSchema, ModelControllerSchema, ModelFrom_optionSchema, ModelInstanceSchema, MoreSchema, ResponseSchema } from "./Initialize";
import { formatModelInstance } from "./ModelCtrlManager";

export const readFactory = (controller: ModelControllerSchema, option: ModelFrom_optionSchema & { modelPath: string }, callPost: (e: EventPostSchema) => ResponseSchema, callPre: (e: EventPreSchema) => Promise<void>) => {
  return async (ctx: ContextSchema, more: MoreSchema): ResponseSchema => {
    const service = "read";
    ctx = { ...ctx };
    ctx.service = service;
    ctx.ctrlName = option.modelPath;
    if (!more) more = {};
    if (!more.savedlist) more.savedlist = [];
    if (!more.signupId) more.signupId = ctx.signup?.id;
    more.__parentModel = "";
    more.modelPath = option.modelPath;
    //Log('auth', { ctx, service, access: option.access, "controller": "" })
    if (!accessValidator({
      ctx,
      access:option.access,
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
    try {
      modelInstance = await option.model.findOne({
        _id: ctx.data.id,
      });

      //Log('__permission', ctx.__permission, '__key', ctx.__key, 'instance__key', modelInstance.__key);
      if (!modelInstance) {
        return await callPost({
          ctx,
          more,
          res: {
            error: "NOT_FOUND",
            ...(await STATUS.NOT_FOUND(ctx, {
              target: option.modelPath.toLocaleUpperCase(),
              message: "modelInstance is null, " + ctx.data.id,
            })),
          },
        });
      }
      more.modelInstance = modelInstance;
      more.__parentModel = modelInstance.__parentModel;
      more.modelId = ctx.data.id;
      //Log('aboutAccessRead', { ctx, service, option, modelInstance })
      await formatModelInstance(ctx, service, option, modelInstance);
      //await modelInstance.select(i)
    } catch (error) {
      return await callPost({
        ctx,
        more,
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
      more,
      res: {
        response: modelInstance,
        ...(await STATUS.OPERATION_SUCCESS(ctx, {
          target: option.modelPath.toLocaleUpperCase(),
        })),
      },
    });
  };
}