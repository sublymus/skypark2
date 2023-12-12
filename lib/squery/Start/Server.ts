import mongoose from "mongoose";
import Log from "sublymus_logger";
import { accessValidator } from "../AccessManager";
import { ContextSchema } from "../Context";
import {
  DescriptionSchema,
  MoreSchema,
  ResponseSchema,
} from "../Initialize";
import { parentInfo } from "../ModelCtrlManager";
import { Controller } from "../SQuery_controller";
import { Local } from "../SQuery_init";
import { SQuery } from "../SQuery";


export const ServerController = new Controller({
  name:'server',
  services:{
    disconnection: async (ctx: ContextSchema): ResponseSchema => {
      const token ={};
      if(!ctx.socket) return
      ctx.socket.request.headers.cookie = ctx.data.cookie
      await SQuery.Cookies(ctx.socket ,'token', token );
      return {
        response: "OPERATION_SUCCESS",
        status: 404,
        code: "OPERATION_SUCCESS",
        message: 'OPERATION_SUCCESS',
      }
    }, 
     setCookie: async (ctx: ContextSchema): ResponseSchema => {
      const token = await SQuery.Cookies(ctx.data.cookie,'token');
      Log('cookiessss',{token} , ctx.data.cookie)
      if(!ctx.socket) return
      ctx.socket.request.headers.cookie = ctx.data.cookie
      await SQuery.Cookies(ctx.socket ,'token', token );
      return {
        response: "OPERATION_SUCCESS",
        status: 404,
        code: "OPERATION_SUCCESS",
        message: 'OPERATION_SUCCESS',
      }
    },
    collector: async (ctx: ContextSchema): ResponseSchema => {
      const {data} = ctx;
       
      console.log(`***`,{data});
      const collect: any = {};
  
      for (const p in data) {
        if (Object.prototype.hasOwnProperty.call(data, p)) {
          const arrayId = data[p];
         if(!Array.isArray(arrayId)) continue;
          const promises = arrayId.map((id: any) => {
            return new Promise<any>(async (rev) => {
              const res = await Local.ModelControllers[p]?.services.read({
                ...ctx,
                data:{
                  id,
                  deep:0,
                }
              });
              if(!res?.response) return rev(null);
              rev(res.response);
            });
          });
  
          const instances = await Promise.allSettled(promises);
          const validResult = instances.map((data: any) => {
            return data.value;
          });
  
          collect[p] = validResult;
          Log('collect' ,collect);
        }
      }
      return {
        response: collect,
        status: 202,
        code: "OPERATION_SUCCESS",
        message: "",
      };
    },
    currentClient: async (ctx: ContextSchema): ResponseSchema => {
      const token = await SQuery.Cookies(ctx.socket, "token");
      if(!token) throw new Error("you don't have current client");
      
      return {
        response: {
          login: {
            modelPath: token.__loginModelPath,
            id: token.__loginId,
          },
          signup: {
            modelPath: token.__signupModelPath,
            id: token.__signupId,
          },
        },
        status: 202,
        code: "OPERATION_SUCCESS",
        message: "",
      };
    },
    description: async (ctx: ContextSchema): ResponseSchema => {
      try {
        if (!ctx.data.modelPath) {
          return {
            error: "OPERATION_FAILED",
            status: 404,
            code: "OPERATION_FAILED",
            message: 'modelPath is missing in data',
          };
        }
        
        const description: DescriptionSchema = {
          ...Local.ModelControllers[ctx.data.modelPath]?.model.schema.description,
        };
  
        for (const key in description) {
          if (Object.prototype.hasOwnProperty.call(description, key)) {
            const rule = { ...description[key] };
  
            if (Array.isArray(rule)) {
              if (rule[0].access == "secret") {
                delete description[key];
                continue;
              }
              (rule[0] as any).type = rule[0].type?.name;
              if (rule[0].match) {
                (rule[0] as any).match = rule[0].match.toString();
              }
            } else if (!Array.isArray(rule)) {
              if (rule.access == "secret") {
                delete description[key];
                continue;
              }
              (rule as any).type = rule.type?.name;
              if (rule.match) {
                const s = rule.match.toString();
                (rule as any).match = s.substring(1, s.lastIndexOf("/"));
              }
            }
          }
        }
        return {
          response: description,
          status: 202,
          code: "OPERATION_SUCCESS",
          message: "",
        };
      } catch (error: any) {
        return {
          error: "OPERATION_FAILED",
          status: 404,
          code: "OPERATION_FAILED",
          message: error.message,
        };
      }
    },
    descriptions: async (
      ctx: ContextSchema,
      more?: MoreSchema
    ): ResponseSchema => {
      try {
        const descriptions: {
          [p: string]: DescriptionSchema;
        } = {};
  
        for (const key in Local.ModelControllers) {
          ctx.data.modelPath = key;
          descriptions[key] = (await ServerController.services.description(ctx))?.response;
        }
        return {
          response: descriptions,
          status: 202,
          code: "OPERATION_SUCCESS",
          message: "",
        };
      } catch (error: any) {
        return {
          error: "NOT_FOUND",
          status: 404,
          code: "UNDEFINED",
          message: error.message,
        };
      }
    },
    instanceId: async (ctx: ContextSchema): ResponseSchema => {
      try {
        const local_modelInstance = await Local.ModelControllers[
          ctx.data.modelPath
        ]?.model.findOne({
          _id: ctx.data.id,
        });
        if (!local_modelInstance) {
          Log(
            "ERROR_validId",
            `Id not found; modePath:${ctx.data.modelPath} Id: ${ctx.data.id} `
          );
          throw new Error(
            `Id not found; modePath:${ctx.data.modelPath} Id: ${ctx.data.id}`
          );
        }
        return {
          response: true,
          status: 404,
          code: "OPERATION_SUCCESS",
          message: "OPERATION_SUCCESS",
        };
      } catch (error) {
       console.log(error);
       
      }
    },
    validId: async (ctx: ContextSchema): ResponseSchema => {
      try {
        if (
          new mongoose.Types.ObjectId(ctx.data.id)._id.toString() == ctx.data.id
        ) {
          return {
            response: true,
            status: 404,
            code: "OPERATION_SUCCESS",
            message: "OPERATION_SUCCESS",
          };
        }
        throw new Error("ID is not valid");
      } catch (error: any) {
        return {
          error: "BAD_ARGUMENT",
          status: 404,
          code: "BAD_ARGUMENT",
          message: error.message,
        };
      }
    },
    extractor: async (ctx: ContextSchema): ResponseSchema => {
      try {
        const { modelPath, id, extractorPath } = ctx.data as {
          modelPath: string;
          id: string;
          extractorPath: string;
        };
        const parts = extractorPath.split("/");
        const illegalMessage =
          "illegal argument : " +
          extractorPath +
          " ; Example : './' , './account' , '../' , '../../account/profile' ,  ";
  
        if (parts[0] != "." && parts[0] != "..") throw new Error(illegalMessage);
        let canStart = true;
        let canUpToParent = true;
        let accu = "";
  
        const isValidProperty = (part: string) => {
          return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(part);
        };
        // //let current:any = ModelControllers[]
        // const isValidArrayProperty = (part: string) => {
        //     return /^[a-zA-Z_][a-zA-Z0-9_]*\[([0-9]{1,4})\]$/.test(part);
        //
        let res = await Local.ModelControllers[modelPath]?.services.read?.({
          ...ctx,
          data: { id },
        });
        if (!res || res.error) {
          return {
            error: "OPERATION_FAILED",
            status: 404,
            code: "OPERATION_FAILED",
            message:
              "modelPath = " +
              modelPath +
              " ; id = " +
              id +
              " is not found; serverMessage = " +
              +JSON.stringify(res),
          };
        }
        let currentDoc = res.response;
        let currentModelPath = modelPath;
        let currentDescription: DescriptionSchema =
        Local.ModelControllers[modelPath]?.model.schema.description;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          accu += part + "/";
          if (part == "") continue;
          else if (part == ".") {
            if (!canStart)
              throw new Error(
                "< . >  is only use to start the path, Example: ./p1/p2 , currentPath:" +
                accu +
                " <-- is not correct;   " +
                illegalMessage
              );
            canStart = false;
            canUpToParent = false;
          } else if (part == "..") {
            if (!canUpToParent)
              throw new Error(
                "< .. >  is Only use at the start of the path, Example: ../../../p1/p2 , currentPath:" +
                accu +
                " <-- is not correct;   " +
                illegalMessage
              );
  
            const info = parentInfo(currentDoc.__parentModel);
            res = await Local.ModelControllers[info.parentModelPath]?.services.read?.({
              ...ctx,
              data: { id: info.parentId },
            });
            if (!res || res.error) {
              return {
                error: "OPERATION_FAILED",
                status: 404,
                code: "OPERATION_FAILED",
                message:
                  "currentPath : " +
                  accu +
                  " <-- is not found; modelPath = " +
                  modelPath +
                  " ; id = " +
                  id +
                  " is not found; serverMessage = " +
                  res,
              };
            }
            currentDoc = res.response;
            currentModelPath = info.parentModelPath;
            currentDescription =
            Local.ModelControllers[info.parentModelPath]?.model.schema.description;
          } else if (isValidProperty(part)) {
            canUpToParent = false;
            const rule = currentDescription[part];
            if (!rule) {
              throw new Error("currentPath : " + accu + " <-- is not found;   ");
            } else if (Array.isArray(rule) && rule[0].ref) {
              throw new Error(
                "currentPath : " +
                accu +
                " <-- is ObjectId array property ; You must recover his parent  "
              );
            } else if (Array.isArray(rule)) {
              throw new Error(
                "currentPath : " +
                accu +
                " <-- is array property ; You must recover his parent  "
              );
            } else if (!Array.isArray(rule) && !rule.ref) {
              throw new Error(
                "currentPath : " +
                accu +
                " <-- is not a ObjectId property ; ; You must recover his parent  "
              );
            }
            let res = await Local.ModelControllers[rule.ref || ''].services.read?.({
              ...ctx,
              data: { id: currentDoc[part] },
            });
            if (!res || res.error) {
              return {
                error: "OPERATION_FAILED",
                status: 404,
                code: "OPERATION_FAILED",
                message:
                  "modelPath = " +
                  rule.ref +
                  " ; id = " +
                  currentDoc[part] +
                  " is not found; serverMessage = " +
                  JSON.stringify(res),
              };
            }
            currentDoc = res.response;
            currentModelPath = rule.ref || '';
            currentDescription =
            Local.ModelControllers[rule.ref || '']?.model.schema.description;
          } else {
            throw new Error(illegalMessage);
          }
        }
        const result = {
          modelPath: currentModelPath,
          id: currentDoc._id.toString(),
        };
        Log("result", { result });
        return {
          response: result,
          status: 200,
          code: "OPERATION_SUCCESS",
          message: "OPERATION_SUCCESS",
        };
      } catch (error: any) {
        return {
          error: "ILLEGAL_ARGUMENT",
          status: 407,
          code: "ILLEGAL_ARGUMENT",
          message: error.message,
        };
      }
    },
  },
});
