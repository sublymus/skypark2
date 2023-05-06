import Log from "sublymus_logger";
import { ContextSchema } from "./Context";
import {
  CtrlModelMakerSchema,
  DescriptionSchema,
  EventPostSchema,
  EventPreSchema,
  ListenerPostSchema,
  ListenerPreSchema,
  ModelServiceAvailable,
  ModelControllers,
  ModelControllerSchema,
  ModelFrom_optionSchema,
  ModelInstanceSchema,
  MoreSchema,
  PopulateSchema,
  ResponseSchema,
  TypeRuleSchema,
  ToolsInterface,
  Tools,
} from "./Initialize";
import { accessValidator } from "./AccessManager";
import { FileValidator } from "./FileManager";
import { deleteFactory } from "./Model_delete";
import { createFactory } from "./Model_Create";
import { readFactory } from "./Model_read";
import { listFactory } from "./Model_list";
import { updateFactory } from "./Model_update";
const MakeModelCtlForm: (
  options: ModelFrom_optionSchema
) => CtrlModelMakerSchema = (
  options: ModelFrom_optionSchema
): CtrlModelMakerSchema => {
    const option: ModelFrom_optionSchema & { modelPath: string } = {
      ...options,
      modelPath: options.model.modelName,
    };
    option.schema.model = option.model;
    const EventManager: {
      [p: string]: {
        pre: ListenerPreSchema[];
        post: ListenerPostSchema[];
      };
    } = {};

    const callPre: (e: EventPreSchema) => Promise<void> = async (
      e: EventPreSchema
    ) => {
      if (!EventManager[e.ctx.service]?.pre) return;

      for (const listener of EventManager[e.ctx.service].pre) {
        try {
          if (listener) await listener(e);
        } catch (error) {
          Log("ERROR_callPre", error);
        }
      }
    };
    const callPost: (e: EventPostSchema) => ResponseSchema = async (
      e: EventPostSchema
    ) => {
      try {
        if (!EventManager[e.ctx.service]?.post) return e.res;
        for (const listener of EventManager[e.ctx.service].post) {

          if (listener) await listener(e);

        }
        return e.res;
      } catch (error) {
        Log("ERROR_callPost", error);
      }
    };
    const ctrlMaker = function () {
      const controller: ModelControllerSchema = {};

      controller[option.volatile ? "create" : "store"] = createFactory(controller, option, callPost, callPre);

      controller["read"] = readFactory(controller, option, callPost, callPre);

      controller["list"] = listFactory(controller, option, callPost, callPre);

      controller["update"] = updateFactory(controller, option, callPost, callPre);

      controller[option.volatile ? "delete" : "destroy"] = deleteFactory(controller, option, callPost, callPre);
      return controller;
    };

    ctrlMaker.option = option;

    ctrlMaker.pre = (
      service: ModelServiceAvailable,
      listener: ListenerPreSchema
    ) => {
      if (!EventManager[service]) {
        EventManager[service] = {
          pre: [],
          post: [],
        };
      }
      EventManager[service].pre.push(listener);
      return ctrlMaker;
    };
    ctrlMaker.post = (
      service: ModelServiceAvailable,
      listener: ListenerPostSchema
    ) => {

      if (!EventManager[service]) {
        EventManager[service] = {
          pre: [],
          post: [],
        };
      }
      EventManager[service].post.push(listener);
      return ctrlMaker;
    };
    ctrlMaker.tools = {} as (ToolsInterface & { maker: CtrlModelMakerSchema });
    ctrlMaker.tools.maker = ctrlMaker;

    for (const tool in Tools) {
      if (Object.prototype.hasOwnProperty.call(Tools, tool)) {
        const func = Tools[tool];
        ctrlMaker.tools[tool] = func.bind(ctrlMaker.tools);
      }
    }
    return (ModelControllers[option.modelPath] = ctrlMaker);
  };

async function formatModelInstance(
  ctx: ContextSchema,
  service: ModelServiceAvailable,
  option: ModelFrom_optionSchema & { modelPath: string },
  modelInstance: ModelInstanceSchema
) {
  const info: PopulateSchema = {};
  deepPopulate(
    ctx,
    service,
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
  service: ModelServiceAvailable,
  ref: string,
  info: PopulateSchema,
  isUser?: boolean
) {
  const description: DescriptionSchema =
    ModelControllers[ref].option.schema.description;
  info.populate = [];
  info.select = "";
  for (const p in description) {
    if (Object.prototype.hasOwnProperty.call(description, p)) {
      const rule = description[p];

      const exec = (rule: TypeRuleSchema) => {
        if (rule.populate == true) {
          const info2 = {
            path: p,
          };
          info.populate.push(info2);
          deepPopulate(ctx, service, rule.ref, info2, isUser);
        }
      };
      if (!Array.isArray(rule)) {
        if (!accessValidator(ctx, rule.access, "property", isUser, p)) {
          info.select = info.select + " -" + p;
          continue;
        }
        if (rule.ref) exec(rule);
      } else if (Array.isArray(rule) && rule[0].ref) {
        if (!accessValidator(ctx, rule[0].access, "property", isUser, p)) {
          info.select = info.select + " -" + p;
          continue;
        }
        exec(rule[0]);
      } else if (Array.isArray(rule)) {
        if (!accessValidator(ctx, rule[0].access, "property", isUser, p)) {
          info.select = info.select + " -" + p;
          continue;
        }
      }
    }
  }
  return;
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
  more.savedlist = [];
  return;
}

function parentInfo(parentModel: string): {
  __parentModel: string;
  parentModelPath: string;
  parentId: string;
  parentProperty: string;
} {
  const parts = parentModel?.split("_");
  const parentModelPath = parts?.[0];
  const parentId = parts?.[1];
  const parentProperty = parts?.[2];
  return {
    __parentModel: parentModel,
    parentModelPath,
    parentId,
    parentProperty,
  };
}

export {
  MakeModelCtlForm,
  backDestroy,
  FileValidator,
  formatModelInstance,
  parentInfo,
};

