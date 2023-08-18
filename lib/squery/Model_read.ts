import { accessValidator } from "./AccessManager";
import { ContextSchema } from "./Context";
import STATUS from "./Errors/STATUS";
import { EventPostSchema, EventPreSchema, ModelControllerSchema, ModelFrom_optionSchema, ModelInstanceSchema, Model_optionSchema, MoreSchema, ResponseSchema, ResultSchema } from "./Initialize";
import { formatModelInstance } from "./ModelCtrlManager";

export const readFactory = (controller: ModelControllerSchema, option: Model_optionSchema, callPost: (e: EventPostSchema) => ResponseSchema, callPre: (e: EventPreSchema) =>Promise<void | ResultSchema>) => {
  return async (ctx: ContextSchema, more?: MoreSchema): ResponseSchema => {
    const service = "read";
    ctx = { ...ctx };
    ctx.service = service;
    ctx.ctrlName = option.modelPath;
    if (!more) more = {};
    if (!more.savedlist) more.savedlist = [];
    more.__parentModel = "";
    more.modelPath = option.modelPath;
    //Log('auth', { ctx, service, access: option.access, "controller": "" })
    if (!accessValidator({
      ctx,
      rule:option,
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
    const preRes = await callPre({
      ctx,
      more,
    });
    if(preRes) return preRes
    let modelInstance: ModelInstanceSchema|undefined|null;
    try {
      modelInstance = await option.model.__findOne({
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
      await formatModelInstance(ctx, option, modelInstance , ctx.data.deep);
      //await modelInstance.select(i)
    } catch (error:any) {
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