import { serialize } from "cookie";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ContextSchema } from "./Context";
import { Controllers, GlobalMiddlewares, Middlewares } from "./Initialize";
import Descriptions from "./ModelDescription";

export type FirstDataSchema = {
  __action: "create" | "read" | "update" | "delete";
  [p: string]: any;
};
export type DataSchema = {
  [p: string]: any;
};

type CallBack = (...arg: any) => any;

const SQuery = function (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  return (modelPath: string) => {
    return async (data: FirstDataSchema, cb?: CallBack) => {
      console.log({ data });

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
      const res = await Controllers["_" + modelPath]?.()[data.__action]?.(ctx);

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
  const io = new Server(server, {
    cookie: true,
  });
  // called during the handshake
  io.engine.on("initial_headers", (headers, request) => {
    console.log("first");

    headers["set-cookie"] = serialize("uid", "1234", { sameSite: "strict" });
  });

  io.on("connection", async (socket: any) => {
    socket.on("server_model", (data: DataSchema, cb: CallBack) => {
      /*
      Controller[data._model].description()
      */

      let modelPath: string = data?.modelPath;
      if (!modelPath || typeof modelPath != "string") {
        return cb?.({
          error: "NOT_FOUND",
          status: 404,
          code: "UNDEFINED",
          message: modelPath + " is not found in Model Resources",
        });
      }

      try {
        cb?.({
          response: format(Descriptions[modelPath]),
          status: 200,
          code: "OPERATION_SUCCESS",
          message: "OPERATION_SUCCESS",
        });
      } catch (error) {
        return cb?.({
          error: "NOT_FOUND",
          status: 404,
          code: "NOT_FOUND",
          message: modelPath + " is not found in Model Resources",
        });
      }
    });
  });
  return io;
};

function format(description: object): object {
  return description;
}
export { SQuery };
