import {Socket } from "socket.io";
import Log from "sublymus_logger";
import { ContextSchema, DataSchema } from "./Context";
import {
  GlobalMiddlewares,
  ResultSchema,
} from "./Initialize";

import { SQuery } from "./SQuery";
import { Local } from "./SQuery_init";

type MapUserCtxSchema = {
  [p: string]: {
    exp: number;
    ctx: any;
    isAvalaibleCtx: boolean;
  };
};
type MainType = (
  socket: Socket
) => (
  ctrlName: string,
  service: string
) => (data: DataSchema, cb?: CallBack) => Promise<void>;


export const MapUserCtx: MapUserCtxSchema = {};
export type AllowedModelService = 'create' | 'read' | 'list' | 'update' | 'delete';
export const modelServiceEnabled: AllowedModelService[] = [
  "create",
  "read",
  "list",
  "update",
  "delete",
];
export type CallBack = (result: ResultSchema | void) => any;

export async function defineContext(
  socket: Socket,
  ctrlName: string,
  service: string,
  data: DataSchema
): Promise<ContextSchema> {
  const decoded = await SQuery.Cookies(socket);
  const token = decoded.token;
  const ctx: ContextSchema = {
    signup: {
      id: token?.__signupId,
      modelPath: token?.__signupModelPath,
    },
    login: {
      id: token?.__loginId,
      modelPath: token?.__loginModelPath,
    },
    ctrlName,
    service,
    data,
    socket,
    __key: token?.__key, /// pour le moment data.__key = cookies[__key]
    __permission: token?.__permission || "any", ///  data.__permission = undefined
  };
  MapUserCtx[token?.__key] = {
    ctx: ctx.socket?.id,
    exp: decoded.exp,
    isAvalaibleCtx: true,
  };
  return ctx;
}

export const Main: MainType = function (socket: Socket) {
  return (ctrlName: string, service:string) => {
    return async (data: DataSchema, cb?: CallBack) => {
      data = data || {};
      Log("squery:data", { data }, { ctrlName }, { service });

      const ctx: ContextSchema = await defineContext(
        socket,
        ctrlName,
        service,
        data
      );
      Log('Client_Cookie', await SQuery.Cookies(socket));
      const midList = [...GlobalMiddlewares];

      for (let i = 0; i < midList.length; i++) {
        const res = await midList[i](ctx);

        if (res !== undefined) return cb?.(res);
      }
      let res: ResultSchema |void| undefined;
     //@ts-ignore
      let modelRequest = !!Local.ModelControllers[ctrlName]?.services[service as AllowedModelService] && modelServiceEnabled.includes(service);
      try {
        if (modelRequest) {
          res = await Local.ModelControllers[ctrlName]?.services[service as AllowedModelService]?.(ctx);
        } else {
          // TODO* Ctrl undefined , service undefined , res?.response undefined
          res = await Local.Controllers[ctrlName]?.services[service]?.(ctx);
        }
      } catch (error: any) {
        Log("ERROR_Controller", error.message);
        if (MapUserCtx[ctx.__key]) MapUserCtx[ctx.__key].isAvalaibleCtx = false;
        return cb?.({
          error: error.message,
          status: 404,
          code: "ERROR_CTRL_UNDEFINED",
          message: "ERROR_CTRL_UNDEFINED",
        });
      }

      if (MapUserCtx[ctx.__key]) MapUserCtx[ctx.__key].isAvalaibleCtx = false;
      if (res === undefined) {
        return cb?.({
          error: "NOT_FOUND",
          status: 404,
          code: "UNDEFINED",
          message: "access not found for Path: " + ctrlName + "." + service,
        });
      }
      // Log('res', res)
      cb?.(res);
    };
  };
};

