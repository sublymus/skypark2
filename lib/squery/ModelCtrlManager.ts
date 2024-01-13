import Log from "sublymus_logger";
import { accessValidator } from "./AccessManager";
import { ContextSchema } from "./Context";
import { FileValidator } from "./FileManager";
import {
  DescriptionSchema,
  EventPostSchema, 
  EventPreSchema,
  ListenerPostSchema,
  ListenerPreSchema,
  ModelControllerSchema,
  ModelInstanceSchema,
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
import { ModelController } from "./SQuery_ModelController";
import { Local } from "./SQuery_init";


export const UNDIFINED_RESULT: ResultSchema = {
  status: 404,
  message: 'UNDEFINED_RESULT',
  error: 'UNDEFINED_RESULT',
  code: 'UNDEFINED_RESULT',
}


async function formatModelInstance(
  ctx: ContextSchema,
  controller: {model:{modelName:string}},
  modelInstance: ModelInstanceSchema,
  deep?: number,ert?:boolean
) {
  const info: PopulateSchema = {
    populate: [],
    select: '',
  };
  deepPopulate(
    ctx,
    controller.model.modelName,
    info,
    modelInstance.__key._id.toString() == ctx.__key, (!Number.isNaN(deep)) ? {
      count: 0,
      max: deep as number
    } : undefined,ert
  );
  await modelInstance.populate(info.populate || []);
  const propertys = info.select?.replaceAll(" ", "").split("-");
  propertys?.forEach((p) => {
    modelInstance[p] = undefined;
  });
  return modelInstance
}

function deepPopulate(
  ctx: ContextSchema,
  ref: string,
  info: PopulateSchema,
  isOwner: boolean,
  count?: {
    count: number,
    max: number
  },ert?:boolean
) {
  const description: DescriptionSchema | undefined =
    Local.ModelControllers[ref]?.model.schema.description;
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
          deepPopulate(ctx, rule.ref || '', info2, isOwner, count);
        }

      };
      if (!Array.isArray(rule)) {
        if(ert)Log('INFO-OWNER',{
          ctx:{
            ...ctx,
            socket:undefined,
            data:undefined
          },
          rule,
            type: "property",
            isOwner,
            property: p,
            accessValidator:accessValidator({
              ctx,
              rule,
              type: "property",
              isOwner,
              property: p,
            })
        })
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
        if(ert)Log('INFO-OWNER',{
          ctx:{
            ...ctx,
            socket:undefined,
            data:undefined
          },
          rule: rule[0],
            type: "property",
            isOwner,
            property: p,
            accessValidator:accessValidator({
              ctx,
              rule:rule[0],
              type: "property",
              isOwner,
              property: p,
            })
        })
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
        if(ert) Log('INFO-OWNER',{
          ctx:{
            ...ctx,
            socket:undefined,
            data:undefined
          },
          rule: rule[0],
          type: "property",
          isOwner,
          property: p,
          accessValidator:accessValidator({
            ctx,
            rule:rule[0],
            type: "property",
            isOwner,
            property: p,
          })
        })
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
    const p = saved?.controller?.services.delete({
      ...ctx,
      data: {
        id: saved.modelId,
        __key: saved.__key,
      },
    });
    return p ? promises.push(p) : promises;
  });
  const log = await Promise.allSettled(promises);
  Log('backDestroy', log);

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
  backDestroy,
  FileValidator,
  // InstanceRule,
  formatModelInstance,
  parentInfo,
};
