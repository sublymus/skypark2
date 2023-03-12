import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongoose_unique_validator from "mongoose-unique-validator";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Log from "sublymus_logger";
import { AuthManager } from "./AuthManager";
import { authDataSchema, ContextSchema } from "./Context";
import { Controllers, DescriptionSchema, GlobalMiddlewares, ModelControllers, ResultSchema } from "./Initialize";

export type FirstDataSchema = {
  __action: "create" | "read" | "list" | "update" | "delete";
  [p: string]: any;
};
const avalaibleModelAction = ['create', 'read', 'list', 'update', 'delete']
type CallBack = (...arg: any) => any;

type SQuerySchema = Function & {
  io: (server: any) => Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  Schema: (description: DescriptionSchema) => any,
  auth: (authData: authDataSchema) => void
}
const SQuery: SQuerySchema = function (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {

  return (ctrlName: string, action: string) => {
    return async (data: FirstDataSchema, cb?: CallBack) => {
      Log("squery:data", data, { ctrlName }, { action })
      let modelRequest = false;
      if (ctrlName.startsWith('model_')) {
        modelRequest = true;
        if (avalaibleModelAction.includes(action) == false) {
          return cb?.({
            error: "NOT_FOUND",
            status: 404,
            code: "UNDEFINED",
            message: "access not found for Controller: " + ctrlName + '.' + action + '; model action must be : [' + avalaibleModelAction.join(', ') + ']',
          });
        }
      }
      const ctx: ContextSchema = {
        ctrlName,
        action,
        data,
        socket,
        __key: "", /// pour le moment data.__key = cookies[__key]
        __permission: "user", ///  data.__permission = undefined
      };

      const midList = [...GlobalMiddlewares];

      for (let i = 0; i < midList.length; i++) {
        const res = await midList[i](ctx);

        if (res !== undefined) return cb?.(res);
      }

      let res: ResultSchema = null;
      if (modelRequest) {
        res = await ModelControllers[ctrlName.replace('model_', '')]?.()[action]?.(ctx);
        Log('rest', { res })
      } else {
        res = await Controllers[ctrlName]?.()[action]?.(ctx);
        Log('wepp', res, { ctrlName }, { ctrlName: Controllers[ctrlName]?.name }, res)
      }

      Log('finish', { modelRequest }, { ctrlName }, { action }, res)
      if (res === undefined) {
        return cb?.({
          error: "NOT_FOUND",
          status: 404,
          code: "UNDEFINED",
          message: "access not found for Path: " + ctrlName + '.' + action,
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
    socket.onAny((event, ...args) => {
      Log('any', { event }, ...args)
    });
    socket.onAnyOutgoing((event, ...args) => {
      Log('any', { event }, ...args)
    });
    const squery = SQuery(socket);
    for (const ctrlName in ModelControllers) {
      if (Object.prototype.hasOwnProperty.call(ModelControllers, ctrlName)) {
        for (const action of avalaibleModelAction) {
          const b = "model_" + ctrlName
          socket.on(b + ':' + action, squery(b, action));
        }
      }
    } /********************    Controllers  *********************** */
    for (const ctrlName in Controllers) {
      if (Object.prototype.hasOwnProperty.call(Controllers, ctrlName)) {
        const ctrlMaker = Controllers[ctrlName];
        const ctrl = ctrlMaker();
        for (const action in ctrl) {
          if (Object.prototype.hasOwnProperty.call(ctrl, action)) {
            socket.on(ctrlName + ":" + action, squery(ctrlName, action));
          }
        }
      }
    }
    /********************   Description   *********************** */
  });
  Global.io = io;
  return io;
};

SQuery.auth = (authData: authDataSchema) => {
  Global.io.on("connection", (socket: any) => {
    Log('********************************************************')
    socket.on("login:" + authData.signup, async (data, cb) => {
      Log('wertyuiopoiuytrtyuio', authData);

      /// authData.login = 'model_' + authData.signup;
      const authCtrl = new AuthManager();
      const res = await authCtrl.login({
        ctrlName: 'login',
        data,
        __key: "",
        __permission: "user",
        action: "read",
        socket,
        authData
      });
      cb(res);
    });
    socket.on("signup:" + authData.signup, async (data, cb) => {
      Log('wertyuiopoiuytrtyuio', authData);
      // authData.signup = 'model_' + authData.signup;
      let __key = new mongoose.Types.ObjectId().toString();
      const authCtrl = new AuthManager();
      const res = await authCtrl.signup({
        ctrlName: 'login',
        action: "create",
        data,
        __key,
        __permission: "user",
        socket,
        authData
      });
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
export { SQuery };
