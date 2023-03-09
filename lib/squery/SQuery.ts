import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongoose_unique_validator from "mongoose-unique-validator";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Log from "sublymus_logger";
import { AuthManager } from "./AuthManager";
import { authDataSchema, ContextSchema } from "./Context";
import { Controllers, DescriptionSchema, GlobalMiddlewares, Middlewares } from "./Initialize";

export type FirstDataSchema = {
  __action: "create" | "read" | "update" | "delete";
  [p: string]: any;
};
export type DataSchema = {
  [p: string]: any;
};

type CallBack = (...arg: any) => any;

type SQuerySchema = Function & {
  io: (server: any) => Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  Schema: (description: DescriptionSchema) => any,
  auth: (authData: authDataSchema) => void
}
const SQuery: SQuerySchema = function (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {

  return (modelPath: string) => {
    return async (data: FirstDataSchema, cb?: CallBack) => {
      Log("squery:data", data, { modelPath })

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


type GlobalSchema = {
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
}
export const Global: GlobalSchema = {
  io: null,
}

SQuery.io = (server: any) => {
  /********************    Cookies   *********************** */
  const io = new Server(server, {
    cookie: true,
  });
  Global.io = io;

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
    socket.on('server:description', getDescription);

  });
  Global.io = io;

  return io;
};

SQuery.auth = (authData: authDataSchema) => {
  Global.io.on("connection", (socket: any) => {
    socket.on("login:" + authData.signup, async (data, cb) => {
      const authCtrl = new AuthManager();
      const res = await authCtrl.login({
        data,
        __key: "",
        __permission: "user",
        action: "create",
        modelPath: "",
        socket,
        authData
      });
      cb(res);
    });
    socket.on("signup:" + authData.signup, async (data, cb) => {
      let __key = new mongoose.Types.ObjectId().toString();

      const authCtrl = new AuthManager();
      const res = await authCtrl.signup({
        data,
        __key,
        __permission: "user",
        action: "create",
        modelPath: data.__modelPath,
        socket,
        authData
      });
      Log("resultat", res);
      cb(res);
    });
  });
};



SQuery.Schema = (description: DescriptionSchema) => {
  description.__parentModel = {
    type: String,
  }
  description.__key = {
    type: Schema.Types.ObjectId,
    required: true,
    access: "secret",
  };
  description.createdAt = {
    type: Date,
    default: Date.now(),
  }
  description.updatedAt = {
    type: Date,
    default: Date.now(),
  }

  const schema = new Schema(description as any);
  (schema as any).description = description;
  schema.plugin(mongoosePaginate);
  schema.plugin(mongoose_unique_validator);
  return schema;
}

let i = 0
function getDescription(data: DataSchema, cb: CallBack) {

  const description: DescriptionSchema = { ...(Controllers[data.modelPath]?.option.schema as any).description };
  for (const key in description) {
    if(key=='__key') continue;
    if (Object.prototype.hasOwnProperty.call(description, key)) {
      const rule = description[key] = { ...description[key] };
      if (Array.isArray(rule)) {
        (rule[0] as any).type = rule[0].type?.name
        if (rule[0].match) {
          (rule[0] as any).match = rule[0].match.toString()
        }
      } else if (!Array.isArray(rule)) {
        (rule as any).type = rule.type?.name
        if (rule.match) {
          const s = rule.match.toString();
          (rule as any).match = s.substring(1, s.lastIndexOf('/'));
        }
      }
    }
  }
  cb(description);
}
export { SQuery };
