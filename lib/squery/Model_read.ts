
import Log from "sublymus_logger";
import { ContextSchema } from "./Context";
import STATUS from "./Errors/STATUS";
import { EventPostSchema, EventPreSchema, ModelControllerSchema, ModelInstanceSchema, MoreSchema, ResponseSchema, ResultSchema } from "./Initialize";
import { formatModelInstance } from "./ModelCtrlManager";
import { ModelController } from "./SQuery_ModelController";

export const readFactory = (
  controller: ModelController,
  callPost: (e: EventPostSchema) => ResponseSchema,
  callPre: (e: EventPreSchema) => Promise<void | ResultSchema>
) => {
   return async (ctx: ContextSchema, more?: MoreSchema): ResponseSchema => {
    const service = "read";
    ctx = { ...ctx };
    ctx.service = service;
    ctx.ctrlName = controller.name;
    if (!more) more = {};
    if (!more.savedlist) more.savedlist = [];
    more.__parentModel = "";
    more.modelPath = controller.name;
    //Log('auth', { ctx, service, access: option.access, "controller": "" })
    // if (!accessValidator({
    //   ctx,
    //   rule:option,
    //   type: "controller"
    //   })) {
    //   return await callPost({
    //     ctx,
    //     more,
    //     res: {
    //       error: "BAD_AUTH_CONTROLLER",
    //       ...(await STATUS.BAD_AUTH(ctx, {
    //         target: controller.name.toLocaleUpperCase(),
    //       })),
    //     },
    //   });
    // }
    const preRes = await callPre({
      ctx,
      more,
    });
    if(preRes) return preRes
    let modelInstance: ModelInstanceSchema|undefined|null;
    try {
      modelInstance = await controller.model.findOne({
        _id: ctx.data.id,
      });
      Log('CONTROLLER',{controller , modelInstance});

      //Log('__permission', ctx.__permission, '__key', ctx.__key, 'instance__key', modelInstance.__key);
      if (!modelInstance) {
        return await callPost({
          ctx,
          more,
          res: {
            error: "NOT_FOUND",
            ...(await STATUS.NOT_FOUND(ctx, {
              target: controller.name.toLocaleUpperCase(),
              message: "modelInstance is null, " + ctx.data.id,
            })),
          },
        });
      }
      more.modelInstance = modelInstance;
      more.__parentModel = modelInstance.__parentModel;
      more.modelId = ctx.data.id;
      //Log('aboutAccessRead', { ctx, service, option, modelInstance })
      await formatModelInstance(ctx, controller, modelInstance , ctx.data.deep);
      //await modelInstance.select(i)
    } catch (error:any) {
      return await callPost({
        ctx,
        more,
        res: {
          error: "SERVER_ERROR",
          ...(await STATUS.NOT_FOUND(ctx, {
            target: controller.name.toLocaleUpperCase(),
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
          target: controller.name.toLocaleUpperCase(),
        })),
      },
    });
  };
}