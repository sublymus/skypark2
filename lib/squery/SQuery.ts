import mongoose, { mongo, Schema } from "mongoose";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Log from "sublymus_logger";
import { ContextSchema } from "./Context";
import { Controllers, DescriptionSchema, GlobalMiddlewares, Middlewares } from "./Initialize";

setTimeout(() => {


}, 1000);
export type FirstDataSchema = {
  __action: "create" | "read" | "update" | "delete";
  [p: string]: any;
};
export type DataSchema = {
  [p: string]: any;
};

type CallBack = (...arg: any) => any;

type SQuerySchema = Function & {
  io:(server:any)=>Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  Schema: (description:DescriptionSchema)=> any
}
const SQuery = function (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {

  return (modelPath: string) => {
    return async (data: FirstDataSchema, cb?: CallBack) => {
      //Log("squery", { data, modelPath })

      const ctx: ContextSchema = {
        action: data.__action,
        data,
        modelPath,
        socket,
        __key: "", /// pour le moment data.__key = cookies[__key]
        __permission: "user", ///  data.__permission = undefined
      };
      const modelPathMids = Middlewares[modelPath];

      let actionMid: any = [];
      if (modelPathMids)
        actionMid = modelPathMids[data.action]
          ? modelPathMids[data.action]
          : [];

      const midList = [...GlobalMiddlewares, ...actionMid];

      for (let i = 0; i < midList.length; i++) {
        const res = await midList[i](ctx);

        if (res !== undefined) return cb?.(res);
      }

      //Log('log', { Controllers })
      const res = await Controllers[modelPath]?.()[data.__action]?.(ctx);

      if (res === undefined) {
        return cb?.({
          error: "NOT_FOUND",
          status: 404,
          code: "UNDEFINED",
          message: "access not found for Model: " + modelPath,
        });
      }
      cb?.(res);
    };
  };
};



SQuery.io = (server: any) => {
  /********************    Cookies   *********************** */
  const io = new Server(server, {
    cookie: true,
  });

  io.on("connection", async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    /********************    Models  *********************** */
    const squery = SQuery(socket);
    for (const modelPath in Controllers) {
      if (Object.prototype.hasOwnProperty.call(Controllers, modelPath)) {
        const model = Controllers[modelPath];
        socket.on(modelPath, squery(modelPath));
      }
    }
    /********************   Description   *********************** */
    socket.on('server:description', getDescription);;
  });

  return io;
};

SQuery.Schema = (description:DescriptionSchema)=>{
  return new Schema(description)
}

function getDescription(data, cb): object {
 const d = {};
  data.models.forEach(modelPath => {

  });

  for (const modelPath in Controllers) {
    if (Object.prototype.hasOwnProperty.call(Controllers, modelPath)) {
      // if Controllers[modelPath].option.access != ['secret']
      d[modelPath] = Controllers[modelPath].option.schema.obj
    }
  }
  Log('d', d['account']);
  return d;
}
export { SQuery };
