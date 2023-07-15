import Log from "sublymus_logger";
import { accessValidator } from "./AccessManager";
import { ContextSchema } from "./Context";
import { FileValidator } from "./FileManager";
import {
  CtrlModelMakerSchema,
  DescriptionSchema,
  EventPostSchema,
  EventPreSchema,
  ListenerPostSchema,
  ListenerPreSchema,
  ModelControllerSchema,
  ModelControllers,
  ModelFrom_optionSchema,
  ModelInstanceSchema,
  ModelServiceAvailable,
  Model_optionSchema,
  MoreSchema,
  PopulateAllSchema,
  PopulateSchema,
  ResponseSchema,
  ResultSchema,
  Tools,
  ToolsInterface,
  TypeRuleSchema,
} from "./Initialize";
import { createFactory } from "./Model_Create";
import { deleteFactory } from "./Model_delete";
import { listFactory } from "./Model_list";
import { readFactory } from "./Model_read";
import { updateFactory } from "./Model_update";
import mongoose from "mongoose";


export const UNDIFINED_RESULT : ResultSchema= {
status:404,
message:'UNDEFINED_RESULT',
error:'UNDEFINED_RESULT',
code:'UNDEFINED_RESULT',
}

const MakeModelCtlForm: (
  options: ModelFrom_optionSchema
) => CtrlModelMakerSchema = (
  options: ModelFrom_optionSchema
): CtrlModelMakerSchema => {

 
   type CompletModel = mongoose.Model<any, unknown, unknown, unknown, any> &{__findOne: (filter?: any, projection?: any, options?: any, callback?: any)=>Promise<ModelInstanceSchema> };
  const  completModel:CompletModel = options.model as CompletModel;
  const option: Model_optionSchema= {
      ...options,
      volatile: options.volatile??true,
      modelPath: options.model.modelName,
      model:completModel,
    };
    option.schema.model = option.model;
    option.model.__findOne = async (filter?: any, projection?: any, options?: any, callback?: any): Promise<ModelInstanceSchema> => {
      const instance: ModelInstanceSchema | null | undefined = await option.model.findOne(filter, projection, options, callback);
     
      //Log('instance',{result});
      return instance as ModelInstanceSchema;
    }


    const EventManager: {
      [p: string]: {
        pre: ListenerPreSchema[];
        post: ListenerPostSchema[];
      };
    } = {};



    const callPre: (e: EventPreSchema) => Promise<void | ResultSchema> = async (
      e: EventPreSchema
    ) => {
      if (!EventManager[e.ctx.service]?.pre) return;

      for (const listener of EventManager[e.ctx.service].pre) {
        try {
          const res = await listener(e);
          if(res) return res;
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
          if (listener){
            const r = await listener(e);
            Log('res__', r);
            
            if(r) return r ;
          }  
        }
        Log('res__', e.res);
        return e.res;
      } catch (error) {
        Log("ERROR_callPost", error);
      }
      Log('res__', e.res);
      return e.res;
    };
    const ctrlMaker = function () {
      const controller: ModelControllerSchema = {};

      controller[option.volatile ? "create" : "store"] = createFactory(
        controller,
        option,
        callPost,
        callPre
      );
      controller["read"] = readFactory(controller, option, callPost, callPre);

      controller["list"] = listFactory(controller, option, callPost, callPre);

      controller["update"] = updateFactory(controller, option, callPost, callPre);

      controller[option.volatile ? "delete" : "destroy"] = deleteFactory(
        controller,
        option,
        callPost,
        callPre
      );
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
    ctrlMaker.tools = {} as ToolsInterface & { maker: CtrlModelMakerSchema };
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
  const info: PopulateSchema = {
    populate:[],
    select:'',
  };
  deepPopulate(
    ctx,
    service,
    option.model.modelName,
    info,
    modelInstance.__key._id.toString() == ctx.__key
  );
  await modelInstance.populate(info.populate||[]);
  const propertys = info.select?.replaceAll(" ", "").split("-");
  propertys?.forEach((p) => {
    modelInstance[p] = undefined;
  });
}

function deepPopulate(
  ctx: ContextSchema,
  service: ModelServiceAvailable,
  ref: string,
  info: PopulateSchema,
  isOwner: boolean,
  count?: {
    count: number,
    max: number
  },
) {
  const description: DescriptionSchema|undefined =
    ModelControllers[ref].option?.schema.description;
  info.populate = [];
  info.select = "";
  for (const p in description) {
    if (Object.prototype.hasOwnProperty.call(description, p)) {
      const rule = description[p];

      const exec = (rule: TypeRuleSchema) => {
        if (rule.deep && !count) {
          count = {
            count: 0,
            max: rule.deep as number
          }
        }
        if (count && (count.count < count.max)) {
          count.count++;
          const info2 = {
            path: p,
          };
          info.populate?.push(info2);
          deepPopulate(ctx, service, rule.ref||'', info2, isOwner, count);
        }

      };
      if (!Array.isArray(rule)) {
        rule
        if (
          !accessValidator({
            ctx,
            rule,
            type: "property",
            isOwner,
            property: p,
          })
        ) {
          info.select = info.select + " -" + p;
          continue;
        }
        if (rule.ref) exec(rule);
      } else if (Array.isArray(rule) && rule[0].ref) {
        if (
          !accessValidator({
            ctx,
            rule: rule[0],
            type: "property",
            isOwner,
            property: p,
          })
        ) {
          info.select = info.select + " -" + p;
          continue;
        }
        exec(rule[0]);
      } else if (Array.isArray(rule)) {
        if (
          !accessValidator({
            ctx,
            rule: rule[0],
            type: "property",
            isOwner,
            property: p,
          })
        ) {
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
  more?.savedlist?.forEach((saved) => {
    const p = saved?.controller[saved.volatile ? "delete" : "destroy"]?.({
      ...ctx,
      data: {
        id: saved.modelId,
        __key: saved.__key,
      },
    });
    return p?promises.push(p):promises;
  });
  const log = await Promise.allSettled(promises);
  Log('backDestroy',log);

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

// function InstanceRule(instance:ModelInstanceSchema){
//   const parts = instance.__parentModel.split('_');
//   const parentModelPath = parts?.[0];
//   const parentId = parts?.[1];
//   const parentProperty = parts?.[2];
//   const instanceModelPatth = parts?.[2];
//   const description: DescriptionSchema = ModelControllers[instanceModelPatth].option.schema.description;
//   const propertyRule = description[in]
// }
// function collectRule(){

// }

export {
  MakeModelCtlForm,
  backDestroy,
  FileValidator,
  // InstanceRule,
  formatModelInstance,
  parentInfo,
};
