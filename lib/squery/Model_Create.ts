import mongoose from "mongoose";
import Log from "sublymus_logger";
import { accessValidator } from "./AccessManager";
import { ContextSchema } from "./Context";
import STATUS from "./Errors/STATUS";
import {
  Controllers,
  DescriptionSchema,
  EventPostSchema,
  EventPreSchema,
  ModelControllerSchema,
  ModelControllers,
  ModelFrom_optionSchema,
  ModelInstanceSchema,
  Model_optionSchema,
  MoreSchema,
  ResponseSchema,
  ResultSchema,
} from "./Initialize";
import { FileValidator, backDestroy, parentInfo } from "./ModelCtrlManager";
import { assigneToNewListElementData, assigneTonewElementFunc } from "./Start/Tools";

export const createFactory = (
  controller: ModelControllerSchema,
  option: Model_optionSchema,
  callPost: (e: EventPostSchema) => ResponseSchema,
  callPre: (e: EventPreSchema) => Promise<void | ResultSchema>
) => {

  return async (ctx: ContextSchema, more?: MoreSchema): ResponseSchema => {
    // if (option.modelPath == 'account' || option.modelPath == 'user') {
    //   setTimeout(() => {
    //     Log('des***', {
    //       model: option.modelPath,
    //       ...option.schema.description
    //     })
    //   }, 2000);
    // }
    const service = option.volatile ? "create" : "store";
    ctx = { ...ctx };
    ctx.service = service;
    ctx.ctrlName = "" + option.modelPath;
    if (!more) more = {};
    if (!more.parentList) more.parentList = [];
    if (!more.savedlist) more.savedlist = [];
    if (!more.__parentModel) more.__parentModel = "";
    more.modelPath = option.modelPath;

    if (
      !accessValidator({
        ctx,
        rule: option,
        type: "controller",
      })
    ) {
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

    const modelId = new mongoose.Types.ObjectId().toString();
    const description: DescriptionSchema = option.schema.description;
    more.modelId = modelId;
    more.modelPath = option.modelPath;
    const preRes = await callPre({
      ctx,
      more,
    });
    if (preRes) return preRes

    const accu: MoreSchema = {};
    let modelInstance: ModelInstanceSchema | null = null;

    if (!ctx.__key)
      return callPost({
        ctx,
        more,
        res: {
          error: "ILLEGAL_ARGUMENT",
          status: 404,
          code: "ILLEGAL_ARGUMENT",
          message: "__key missing",
        },
      });
    for (const property in description) {
      const rule = description[property];
      if (ctx.data?.[property] == undefined) {
        // Log('deffff', {
        //   property,
        //   value: ctx.data?.[property],
        //   _default: ctx.data[property] = !Array.isArray(rule) ? rule?._default : rule[0]?._default,
        //   rule
        // })
        if (Array.isArray(rule)) {
          ctx.data[property] = rule[0]?._default || [];
        } else {
          ctx.data[property] = rule._default;
        }
      }
      if (
        Object.prototype.hasOwnProperty.call(description, property) &&
        ctx.data[property] != undefined
      ) {

        // Log("log2", { 
        //   property,
        //   value: ctx.data[property],
        //   modelPath: option.modelPath,
        // });
        if (!Array.isArray(rule) && rule.ref) {
          const isStr = typeof ctx.data[property] == "string";

          const isAlien = !!(rule.alien || rule.strictAlien);
          // Log('vraiment!!', { isStr, isAlien, strict: rule.strictAlien, value: ctx.data[property], property });
          // Log(
          //     "alien",
          //     "strictAlien: ",
          //     !!rule.strictAlien,
          //     "isStr: ",
          //     isStr,
          //     option.modelPath,
          //     "result: ",
          //     !!rule.strictAlien && !isStr
          // );
          if (!isAlien && isStr) {
            await backDestroy(ctx, more);
            return await callPost({
              ctx,
              more,
              res: {
                error: "ILLEGAL_ARGUMENT",
                status: 404,
                code: "ILLEGAL_ARGUMENT",
                message:
                  "the property not a alien @01 ; value must be creation data object;" +
                  "<" +
                  option.modelPath +
                  ">:<" +
                  service +
                  "> , can not create child :<" +
                  property +
                  ">, ref = <" +
                  rule.ref +
                  "> with id : <" +
                  ctx.data[property] +
                  ">",
              },
            });
          } else if (isAlien && isStr) {
            try {
              const alienId = ctx.data[property];
              // const validId = (
              //   await Controllers["server"]()["instanceId"]({
              //     ...ctx,
              //     data: {
              //       id: alienId,
              //       modelPath: rule.ref,
              //     },
              //   })
              // )?.response;
              // if (validId) {
              //   accu[property] = alienId;
              // }
              accu[property] = alienId;
            } catch (error) {
              await backDestroy(ctx, more);
              return await callPost({
                ctx,
                more,
                res: {
                  error: "ILLEGAL_ARGUMENT",
                  status: 404,
                  code: "ILLEGAL_ARGUMENT",
                  message:
                    "<" +
                    option.modelPath +
                    ">:<" +
                    service +
                    "> , can not create child @02:<" +
                    property +
                    ">, ref = <" +
                    rule.ref +
                    "> with id : <" +
                    ctx.data[property] +
                    ">",
                },
              });
            }
            continue;
          } else if (!!rule.strictAlien && !isStr) {
            await backDestroy(ctx, more);
            return await callPost({
              ctx,
              more,
              res: {
                error: "ILLEGAL_ARGUMENT",
                status: 404,
                code: "ILLEGAL_ARGUMENT",
                message:
                  "the property strictAlien.. ; value must be id;" +
                  "<" +
                  option.modelPath +
                  ">:<" +
                  service +
                  "> , can not create child @03:<" +
                  property +
                  ">, ref = <" +
                  rule.ref +
                  "> with id : <" +
                  ctx.data[property] +
                  ">",
              },
            });
          }
          const ctrl = ModelControllers[rule.ref]();
          // Log("log", {
          //     property,
          //     value: ctx.data[property],
          //     modelPath: option.modelPath,
          // });
          const res = await (ctrl.create || ctrl.store)?.(
            {
              ...ctx,
              data: ctx.data[property],
            },
            {
              ...more,
              parentList : [...more.parentList,{
                modelPath:option.modelPath,
                id:modelId,
              }],
              __parentModel:
                option.modelPath +
                "_" +
                modelId +
                "_" +
                property +
                "_" +
                rule.ref,
            }
          );
          if (!res?.response) {
            // Log('log', { res, property, value: ctx.data[property], modelPath: option.modelPath })

            Log('defffff', res)
            await backDestroy(ctx, more);
            // Log('log', { res })
            return await callPost({
              ctx,
              more,
              res: res ?? {
                error: "ACCESS_NOT_FOUND",
                status: 404,
                code: "ACCESS_NOT_FOUND",
                message:
                  "<" +
                  option.modelPath +
                  ">:<" +
                  service +
                  "> , can not create child @04:<" +
                  property +
                  ">, ref = <" +
                  rule.ref +
                  "> with id : <" +
                  ctx.data[property] +
                  ">",
              },
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
            const isStr = typeof ctx.data[property][i] == "string";
            const isAlien = !!(rule[0].alien || rule[0].strictAlien);
            // Log('alien', 'strictAlien: ', !!rule[0].strictAlien, 'isStr: ', isStr, option.modelPath, 'result: ', (!!rule[0].strictAlien) && !isStr)
            if (!isAlien && isStr) {
              await backDestroy(ctx, more);
              return await callPost({
                ctx,
                more,
                res: {
                  error: "ILLEGAL_ARGUMENT",
                  status: 404,
                  code: "ILLEGAL_ARGUMENT",
                  message:
                    "the property not a alien.. ; value must be creation data object;" +
                    "<" +
                    option.modelPath +
                    ">:<" +
                    service +
                    "> , can not create child @05:<" +
                    property +
                    ">, ref = <" +
                    rule[0].ref +
                    "> with id : <" +
                    ctx.data[property][i] +
                    ">",
                },
              });
            } else if (isAlien && isStr) {
              try {
                const alienId = ctx.data[property][i];
                const validId = (
                  await Controllers["server"]()["instanceId"]({
                    ...ctx,
                    data: {
                      id: alienId,
                      modelPath: rule[0].ref,
                    },
                  })
                )?.response;
                if (validId) {
                  accu[property][i] = alienId;
                }
              } catch (error: any) {
                await backDestroy(ctx, more);
                return await callPost({
                  ctx,
                  more,
                  res: {
                    error: error.message,
                    status: 404,
                    code: "ILLEGAL_ARGUMENT",
                    message:
                      "<" +
                      option.modelPath +
                      ">:<" +
                      service +
                      "> , can not create child@06:<" +
                      property +
                      ">, ref = <" +
                      rule[0].ref +
                      "> with id : <" +
                      ctx.data[property][i] +
                      ">",
                  },
                });
              }
              continue;
            } else if (!!rule[0].strictAlien && !isStr) {
              await backDestroy(ctx, more);
              return await callPost({
                ctx,
                more,
                res: {
                  error: "ILLEGAL_ARGUMENT",
                  status: 404,
                  code: "ILLEGAL_ARGUMENT",
                  message:
                    "the property strictAlien.. ; value must be id;" +
                    "<" +
                    option.modelPath +
                    ">:<" +
                    service +
                    "> , can not create child @07:<" +
                    property +
                    ">, ref = <" +
                    rule[0].ref +
                    "> with id : <" +
                    ctx.data[property][i] +
                    ">",
                },
              });
            }
            const res = await (ctrl.create || ctrl.store)?.(
              {
                ...ctx,
                data: ctx.data[property][i],
              },
              {
                ...more,
                parentList : [...more.parentList,{
                  modelPath:option.modelPath,
                  id:modelId,
                }],
                //TODO* renplacer le parent model par parent list avec le format du parent model (string condancer)
                __parentModel:
                  option.modelPath +
                  "_" +
                  modelId +
                  "_" +
                  property +
                  "_" +
                  rule[0].ref,
              }
            );
            Log("log_list", {
              res,
              property,
              value: ctx.data[property][i],
              modelPath: option.modelPath,
            });
            if (!res?.response) {
              await backDestroy(ctx, more);
              Log('logA', { res })
              return await callPost({
                ctx,
                more,
                res: {
                  error: 'NOT_CREATED',
                  ...await STATUS.NOT_CREATED(ctx),
                },
              });
            }
            accu[property][i] = res.response;
          }
        } else if (Array.isArray(rule) && rule[0].file) {
          // accu[property] = await FileValidator(ctx, service , rule[0], ctx.data[property])
          Log("File", ctx.data[property]);
          try {
            accu[property] = await FileValidator(
              ctx,
              service,
              rule[0],
              ctx.data[property],
              [], /// les paths existant
              {
                modelPath: option.modelPath,
                id: modelId,
                property: property,
              }
            );
          } catch (error: any) {
            await backDestroy(ctx, more);
            Log('logB', '_____')
            return await callPost({
              ctx,
              more,
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
      } else {
        // const rule = description[property];
        // if (Array.isArray(rule)) {
        //   accu[property] = rule[0].default || [];
        // } else {
        //   accu[property] = rule.default;
        // }
      }
    }
    accu["__key"] = ctx.__key;
    accu["__parentModel"] = more.__parentModel;
    accu["__modePath"] = option.modelPath;
    accu["__createdAt"] = Date.now();
    accu["__parentList"] = more.parentList;
    //Log("logAccu", { accu });
    try {
      modelInstance = new option.model({
        ...accu,
        _id: modelId,
      });
      if (!modelInstance) throw new Error("modelInstance is null");

      await modelInstance?.save();
      more.savedlist.push({
        modelId,
        __key: ctx.__key,
        volatile: option.volatile,
        controller,
      });

      const datas = assigneToNewListElementData;
      const parent = parentInfo(more.__parentModel);
      if (parent.__parentModel && parent.parentId && parent.parentModelPath && parent.parentProperty) {
        const list = datas[option.modelPath] || [];

        for (const data of list) {
          if (parent.parentModelPath == data.parentModelPath && parent.parentProperty == data.parentListProperty) {

            setTimeout(async () => {
              if (!more || !modelInstance) return;
              const e = await assigneTonewElementFunc(data)({
                ctx: {
                  ...ctx,
                  data: {
                    paging: {
                      query: {
                        __parentModel: more.__parentModel
                      }
                    }
                  }
                },
                res: {
                  response: {
                    added: [modelInstance._id.toString()],
                  },
                  code: 'ok',
                  message: 'ok',
                  status: 200,
                }
              })
            }, 2000);
          }
        }
      }

    } catch (error: any) {
      //Log('error', error);
      await backDestroy(ctx, more);
      more.modelInstance = modelInstance;
      Log('logC', '_____')
      return await callPost({
        ctx,
        more,
        res: {
          error: "NOT_CREATED",
          ...(await STATUS.NOT_CREATED(ctx, {
            target: option.modelPath.toLocaleUpperCase(),
            message: error.message,
          })),
        },
      });
    }
    more.modelInstance = modelInstance;
    return await callPost({
      ctx,
      more,
      res: {
        response: modelId,
        ...(await STATUS.CREATED(ctx, {
          target: option.modelPath.toLocaleUpperCase(),
        })),
      },
    });
  };
};
