import Log from "sublymus_logger";
import { accessValidator } from "./AccessManager";
import { ContextSchema } from "./Context";
import STATUS from "./Errors/STATUS";
import { DescriptionSchema, EventPostSchema, EventPreSchema, ModelControllerSchema, ModelInstanceSchema, MoreSchema, ResponseSchema, ResultSchema } from "./Initialize";
import { FileValidator } from "./FileManager";
import { Local } from "./SQuery_init";
import { ModelController } from "./SQuery_ModelController";

export const updateFactory =  (
  controller: ModelController,
  callPost: (e: EventPostSchema) => ResponseSchema,
  callPre: (e: EventPreSchema) => Promise<void | ResultSchema>
) => {
  return async (ctx: ContextSchema, more?: MoreSchema): ResponseSchema => {
    const service = "update";
    ctx = { ...ctx };
    ctx.service = service;
    ctx.ctrlName = controller.name;
    if (!more) more = {};
    if (!more.savedlist) more.savedlist = [];
    more.__parentModel = "";
    more.modelPath = controller.name;
    // if (!accessValidator({
    //   ctx,
    //   rule: option,
    //   type: "controller"
    // })) {
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
    if (preRes) return preRes

    let modelInstance: ModelInstanceSchema|null|undefined;
    const description: DescriptionSchema = controller.model.schema.description;

    try {
      modelInstance = await controller.model.findOne({
        _id: ctx.data.id,
      });
      if (!modelInstance) {
        return await callPost({
          ctx,
          more,
          res: {
            error: "NOT_FOUND",
            ...(await STATUS.NOT_FOUND(ctx, {
              target: controller.name.toLocaleUpperCase(),
            })),
          },
        });
      }
      more.modelInstance = modelInstance;
      more.__parentModel = modelInstance.__parentModel;
      more.modelId = ctx.data.id;
      delete ctx.data.id;
      for (const p in description) {
        if (Object.prototype.hasOwnProperty.call(description, p)) {
          const rule = description[p];

          if (!ctx.data[p]) continue;
          else if (!Array.isArray(rule) && rule.ref) {
            if (!accessValidator({
              ctx,
              rule,
              type: "property",
              isOwner: ctx.__key == modelInstance.__key._id.toString()
            }))
              continue;

            const isStr = typeof ctx.data[p] == "string";
            const isAlien = !!(rule.alien || rule.strictAlien);
            Log(
              "alien",
              "strictAlien: ",
              !!rule.strictAlien,
              "isStr: ",
              isStr,
              controller.name,
              "result: ",
              !!rule.strictAlien && !isStr
            );
            const oldId = modelInstance[p];

            if (rule.strictAlien && !isStr) continue;

            else if (isAlien && isStr){
              try {
                const alienId = ctx.data[p];
                Log('log',{alienId , oldId})
                const validId = (await Local.Controllers['server'].services['instanceId']({
                  ...ctx,
                  data: {
                    id: alienId,
                    modelPath: rule.ref,
                  }
                }))?.response
                if (validId) {
                  modelInstance[p] = alienId;
                }
              } catch (error) {
                Log("Error_Ilegall_Arg_update_ref", error);
                continue;
              }
            }
            else{
              Log('serperLog',{
                [p]:ctx.data[p]
              })
              try {const ctrl = Local.ModelControllers[rule.ref];
                const res = await (ctrl?.services.create ({
                  ...ctx,
                  data: {
                    ...ctx.data[p]
                  }
                }))
                Log("erty",res)
                if (!(!res?.response)) {
                  modelInstance[p] = res.response;
                }
              } catch (error) {
                Log("Error_Ilegall_Arg_update_ref", error);
                continue;
              }
            }

           
            try {
             if(!oldId) continue;

              const impact = rule.impact != false;
              let res: ResultSchema|void |undefined;
              Log("impact", { impact, rule });
              if (impact) {
                const ctrl = Local.ModelControllers[rule.ref];
                res = await ctrl?.services.delete(
                  {
                    ...ctx,
                    data: { id: oldId },
                  },
                  more
                );
                Log("Error_impactRes", res);
              }
              continue;
            } catch (error) {
              Log("Error_update_ref", error);
              continue;
            }
          } else if (Array.isArray(rule)) {
            if (!accessValidator({
              ctx,
              rule: rule[0],
              type: "property",
              isOwner: ctx.__key == modelInstance.__key._id.toString()
            }))
              continue;
            if (rule[0].ref) {
              continue; // remove all , addId, addNew 
            } else if (rule[0].file) {
              try {
                modelInstance[p] = await FileValidator(
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
                    error: "UPLOAD_ERROR",
                    ...(await STATUS.OPERATION_FAILED(ctx, {
                      target: controller.name.toLocaleUpperCase(),
                      message: error.message,
                    })),
                  },
                });
              }
            } else {
              modelInstance[p] = ctx.data[p];
            }
          } else {
            const access = accessValidator({
              ctx,
              rule,
              type: "property",
              isOwner: ctx.__key == modelInstance.__key._id.toString()
            });
            Log(
              "AboutUpdateAccess",
              "<update>",
              "access:",
              rule.access,
              "<property>",
              "user: ",
              ctx.__key == modelInstance.__key._id.toString()
            );
            if (!access) continue;
            modelInstance[p] = ctx.data[p];
          }
        }
      }
    } catch (error:any) {
      return await callPost({
        ctx,
        more,
        res: {
          error: "OPERATION_FAILED",
          ...(await STATUS.NOT_FOUND(ctx, {
            target: controller.name.toLocaleUpperCase(),
            message: error.message,
          })),
        },
      });
    }

    try {
      await modelInstance.save();
    } catch (error:any) {
      return await callPost({
        ctx,
        more,
        res: {
          error: "OPERATION_FAILED",
          ...(await STATUS.OPERATION_FAILED(ctx, {
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
        response: (
          await controller.services.read({
            ...ctx,
            data: {
              id: modelInstance._id.toString(),
            },
          })
        )?.response,
        ...(await STATUS.OPERATION_SUCCESS(ctx, {
          target: controller.name.toLocaleUpperCase(),
        })),
      },
    });
  };

}