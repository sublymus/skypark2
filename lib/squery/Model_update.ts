import Log from "sublymus_logger";
import { accessValidator } from "./AccessManager";
import { ContextSchema } from "./Context";
import STATUS from "./Errors/STATUS";
import { Controllers, DescriptionSchema, EventPostSchema, EventPreSchema, ModelControllerSchema, ModelControllers, ModelFrom_optionSchema, ModelInstanceSchema, MoreSchema, ResponseSchema, ResultSchema } from "./Initialize";
import { FileValidator } from "./FileManager";

export const updateFactory = (controller: ModelControllerSchema,option :ModelFrom_optionSchema & { modelPath: string },callPost: (e: EventPostSchema) => ResponseSchema  , callPre :(e: EventPreSchema) => Promise<void> )=>{
    return    async (ctx:ContextSchema, more:MoreSchema): ResponseSchema => {
        const service = "update";
        ctx = {...ctx};
        ctx.service = service;
        ctx.ctrlName = option.modelPath;
        if (!more) more = {};
        if (!more.savedlist) more.savedlist = [];
        if(!more.signupId) more.signupId = ctx.signup?.id;
        more.__parentModel = "";
        more.modelPath = option.modelPath;
        if (!accessValidator(ctx, option.access, "controller")) {
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
          more:more,
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
              more,
              res: {
                error: "NOT_FOUND",
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

              if (!ctx.data[p]) continue;
              else if (!Array.isArray(rule) && rule.ref) {
                if (
                  !accessValidator(
                    ctx,
                    rule.access,
                    "property",
                    ctx.__key == modelInstance.__key._id.toString()
                  )
                )
                  continue;

                const isStr = typeof ctx.data[p] == "string";
                const isAlien = !!(rule.alien || rule.strictAlien);
                Log(
                  "alien",
                  "strictAlien: ",
                  !!rule.strictAlien,
                  "isStr: ",
                  isStr,
                  option.modelPath,
                  "result: ",
                  !!rule.strictAlien && !isStr
                );
                if (!(isAlien && isStr)) continue;

                const oldId = modelInstance[p];
                try {
                  const alienId = ctx.data[p];
                  const validId = (await Controllers['server']()['instanceId']({
                    ...ctx,
                    data: {
                      id: alienId,
                      modelPath: rule.ref,
                    }
                  })).response
                  if (validId) {
                    modelInstance[p] = alienId;
                  }
                } catch (error) {
                  Log("Error_Ilegall_Arg_update_ref", error);
                  continue;
                }
                try {
                  const validId = (await Controllers['server']()['instanceId']({
                    ...ctx,
                    data: {
                      id: oldId,
                      modelPath: rule.ref,
                    }
                  })).response
                  if (!validId) {
                    continue;
                  }

                  const impact = rule.impact != false;
                  let res: ResultSchema;
                  Log("impact", { impact, rule });
                  if (impact) {
                    res = await ModelControllers[rule.ref]().delete(
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
                if (
                  !accessValidator(
                    ctx,
                    rule[0].access,
                    "property",
                    ctx.__key == modelInstance.__key._id.toString()
                  )
                )
                  continue;
                if (rule[0].ref) {
                  continue;
                } else if (rule[0].file) {
                  try {
                    modelInstance[p] = await FileValidator(
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
                const access = accessValidator(
                  ctx,
                  rule.access,
                  "property",
                  ctx.__key == modelInstance.__key._id.toString()
                );
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
        } catch (error) {
          return await callPost({
            ctx,
            more,
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
            more,
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
          more,
          res: {
            response: (
              await controller.read({
                ...ctx,
                data: {
                  id: modelInstance._id.toString(),
                },
              })
            ).response,
            ...(await STATUS.OPERATION_SUCCESS(ctx, {
              target: option.modelPath.toLocaleUpperCase(),
            })),
          },
        });
      };

}