import { parse, serialize } from "cookie";
import jwt from "jsonwebtoken";

import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongoose_unique_validator from "mongoose-unique-validator";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Log from "sublymus_logger";
import { Config } from "../../squeryconfig";
import { AuthManager } from "./AuthManager";
import {
  ContextSchema,
  DataSchema,
  authDataOptionSchema,
  authDataSchema,
} from "./Context";
import {
  Controllers,
  DescriptionSchema,
  GlobalMiddlewares,
  ListenerPostSchema,
  ListenerPreSchema,
  ModelControllers,
  ResultSchema,
  SQueryMongooseSchema,
} from "./Initialize";
import EventEmiter from "./event/eventEmiter";
type MapUserCtxSchema = {
  [p: string]: {
    exp: number;
    ctx: any;
    isAvalaibleCtx: boolean;
  };
};
export const MapUserCtx: MapUserCtxSchema = {};

export type FirstDataSchema = {
  __action: "create" | "read" | "list" | "update" | "delete";
  [p: string]: any;
};
const avalaibleModelAction = ["create", "read", "list", "update", "delete"];
type CallBack = (result: ResultSchema | void) => any;
async function defineContext(
  socket: Socket,
  ctrlName: string,
  action: string,
  data: DataSchema
): Promise<ContextSchema> {
  const decoded = await SQuery.cookies(socket);
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
    action,
    data,
    socket,
    __key: token?.__key, /// pour le moment data.__key = cookies[__key]
    __permission: token?.__permission || "any", ///  data.__permission = undefined
  };
  MapUserCtx[token?.__key] = {
    ctx: ctx.socket.id,
    exp: decoded.exp,
    isAvalaibleCtx: true,
  };
  return ctx;
}
type SQuerySchema = Function & {
  emiter: EventEmiter;
  io: (
    server?: any
  ) => Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  Schema: (description: DescriptionSchema) => any;
  auth: (authData: authDataOptionSchema) => void;
  cookies(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    key?: string,
    value?: any
  ): Promise<any>;
};
const SQuery: SQuerySchema = function (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  return (ctrlName: string, action: string) => {
    return async (data: FirstDataSchema, cb?: CallBack) => {
      Log("squery:data", data, { ctrlName }, { action });
      let modelRequest = false;
      if (ctrlName.startsWith("model_")) {
        modelRequest = true;
        if (avalaibleModelAction.includes(action) == false) {
          return cb?.({
            error: "NOT_FOUND",
            status: 404,
            code: "UNDEFINED",
            message:
              "access not found for Controller: " +
              ctrlName +
              "." +
              action +
              "; model action must be : [" +
              avalaibleModelAction.join(", ") +
              "]",
          });
        }
      }
      const ctx: ContextSchema = await defineContext(
        socket,
        ctrlName,
        action,
        data
      );

      const midList = [...GlobalMiddlewares];

      for (let i = 0; i < midList.length; i++) {
        const res = await midList[i](ctx);

        if (res !== undefined) return cb?.(res);
      }
      let res: ResultSchema = null;
      try {
        if (modelRequest) {
          res = await ModelControllers[ctrlName.replace("model_", "")]?.()[
            action
          ]?.(ctx);
        } else {
          res = await Controllers[ctrlName]?.()[action]?.(ctx);
        }
      } catch (error) {
        Log("ERROR_Controller", error.message);
        if (MapUserCtx[ctx.__key]) MapUserCtx[ctx.__key].isAvalaibleCtx = false;
        return cb?.({
          error: "ERROR_CTRL_UNDEFINED",
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
          message: "access not found for Path: " + ctrlName + "." + action,
        });
      }
      // Log('res', res)
      cb?.(res);
    };
  };
};

type GlobalSchema = {
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
};
export const Global: GlobalSchema = {
  io: null,
};

SQuery.cookies = async (socket, key: string, value?: any) => {
  let decoded: any = {};
  try {
    let cookie = socket.request.headers.cookie;
    // Log("SQuery.cookies_parse", JSON.parse(parse(cookie).squery_session));
    // Log("SQuery.cookies_parse", parse(cookie));
    // Log("SQuery.cookies_parse", cookie);
    const squery_session = JSON.parse(parse(cookie).squery_session);
    decoded = jwt.verify(squery_session, Config.KEY) || {};
  } catch (error) {
    Log("jwtError", error.message);
  }
  Log("decoded", { decoded });
  if (key && value) decoded[key] = value;
  if (!key && !value) return decoded;
  if (!value) return decoded[key];

  const generateToken = (payload: { [property: string]: any }) => {
    return jwt.sign(
      {
        ...payload,
      },
      Config.KEY
    );
  };

  let token = generateToken(decoded);
  const cookieToken = serialize("squery_session", JSON.stringify(token), {
    maxAge: Date.now() + 24 * 60 * 60 * 1000,
  });

  return await new Promise((rev) => {
    socket.emit("storeCookie", cookieToken, (clientCookie: string) => {
      socket.request.headers.cookie =
        ((socket.request.headers.cookie as string) || "")
          .split(";")
          .filter((part: string) => {
            Log("clientCookie", clientCookie);
            part = part.trim();
            return !part.startsWith("squery_session");
          })
          .join("; ") +
        "; " +
        cookieToken;
      rev(clientCookie);
    });
  });
};

SQuery.emiter = new EventEmiter();

SQuery.io = (server: any) => {
  /********************    Cookies   *********************** */
  if (!server) {
    return Global.io;
  }
  const io = new Server(server, {
    maxHttpBufferSize: 1e8,
    cookie: {
      name: "io",
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    },
  });
  Global.io = io;
  const setPermission: ListenerPreSchema = async ({ ctx, more }) => {
    ctx.data.__permission = ctx.__permission;
    ctx.data.__signupId = more.__signupId;
  };
  const setAuthValues = (authData: authDataSchema) => {
    const preCreateSignupListener: ListenerPreSchema = async ({
      ctx,
      more,
    }) => {
      ctx.__permission = authData.__permission;
      ctx.__key = new mongoose.Types.ObjectId().toString(); ///// cle d'auth
      more.__signupId = more.modelId;
    };
    return preCreateSignupListener;
  };
  const setLoginCookie = (authData: authDataSchema) => {
    const postCreateLoginListener: ListenerPostSchema = async ({
      ctx,
      more,
      res,
    }) => {
      if (res.error) return Log("Giga_ERROR", res);
      const token = {
        __key: ctx.__key,
        __permission: authData.__permission, // any non loguer, user loguer , admin loguer admin
        __signupId: more.__signupId,
        __signupModelPath: authData.signup,
        __email: more.modelInstance.email,
        __loginId: res.response,
        __loginModelPath: authData.login,
      };
      await SQuery.cookies(ctx.socket, "token", token);
    };
    return postCreateLoginListener;
  };

  let firstConnection = true;
  io.on(
    "connection",
    async (
      socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ) => {
      if (firstConnection) {
        firstConnection = false;
        const readylist = [];
        for (const key in AuthDataMap) {
          if (Object.prototype.hasOwnProperty.call(AuthDataMap, key)) {
            const authData = AuthDataMap[key];
            ModelControllers[authData.signup].pre(
              "create",
              setAuthValues(authData)
            );
            ModelControllers[authData.signup].pre(
              "store",
              setAuthValues(authData)
            );
            if (readylist.includes(authData.login)) continue;
            Log("init_Model_" + authData.login, authData);
            ModelControllers[authData.login].pre("create", setPermission);
            ModelControllers[authData.login].pre("store", setPermission);
            ModelControllers[authData.login].post(
              "create",
              setLoginCookie(authData)
            );
            ModelControllers[authData.login].post(
              "store",
              setLoginCookie(authData)
            );
            readylist.push(authData.login);
          }
        }

        new Promise(() => {
          setInterval(() => {
            for (const key in MapUserCtx) {
              if (Object.prototype.hasOwnProperty.call(MapUserCtx, key)) {
                const ctxData = MapUserCtx[key];
                if (ctxData.exp - Date.now() <= 0) {
                 // Log("delete_data", key);
                  delete MapUserCtx[key];
                }
              }
            }
          }, 10_000);
        });
      }
      /********************    All  *********************** */
      socket.onAny((event, data, cb: CallBack) => { });
      /********************    MapUserCtx  *********************** */

      /********************    Models  *********************** */

      const squery = SQuery(socket);
      for (const ctrlName_modelPath in ModelControllers) {
        if (Object.prototype.hasOwnProperty.call(ModelControllers, ctrlName_modelPath)) {
          for (const service of avalaibleModelAction) {
            const ctrlName = "model_" + ctrlName_modelPath;
            socket.on(ctrlName + ":" + service, squery(ctrlName, service));
          }
        }
      } /********************    Controllers  *********************** */
      for (const ctrlName in Controllers) {
        if (Object.prototype.hasOwnProperty.call(Controllers, ctrlName)) {
          const ctrlMaker = Controllers[ctrlName];
          const ctrl = ctrlMaker();
          for (const service in ctrl) {
            if (Object.prototype.hasOwnProperty.call(ctrl, service)) {
              socket.on(ctrlName + ":" + service, squery(ctrlName, service));
            }
          }
        }
      }
      /********************   Description   *********************** */
    }
  );
  Global.io = io;
  return io;
};
export const AuthDataMap: { [p: string]: authDataSchema } = {};
/*
NB: authDataMap contient les differente auth data,
NB: dans SQuery.schema : pour chaque authdata.signup on ajout un pre/create||store pour donner une nouvelle __key
 et une permission dans le ctx sauvegarder le cookies che le client ;
NB: dans SQuery.schema : pour chaque modelPath on ajout un pre/create||store pour permettre de stoker le authData.__permission
NB: 1 -au lance de l'app le le cookies est passer dans le header, un user deja loger peut faure des requetes pour priver
    2 -au login, le cookies est passer au client, mais ne passe pas automatiquement dans le header du socket,
    3 - le cookies est aussi mis dans le header lors du login.
    4 - la lecture du cookies provient de ce qui est ajouter par le server;
NB:  *** ajout une nouveau cookies dans le header;
socket.request.headers["set-cookie"] = serialize("token", JSON.stringify(token), {
      maxAge: Date.now() + 24 * 60 * 60 * 1000,
    });
socket.request.headers.cookie = ..... // ecrase le cookies du header;
*/
SQuery.auth = (authDataOption: authDataOptionSchema) => {
  const authData: authDataSchema = {
    ...authDataOption,
    __permission: "user:" + authDataOption.signup,
  };
  authData.match.push("__permission");
  AuthDataMap[authData.signup] = authData;

  Global.io.on("connection", (socket: any) => {
    socket.on(
      "login:" + authData.signup,
      async (data: DataSchema, cb: CallBack) => {
        data.__permission = authData.__permission;
        const authCtrl = new AuthManager();
        const res = await authCtrl.login({
          ...(await defineContext(socket, "login", "read", data)),
          authData,
        });
        cb(res);
      }
    );
    socket.on(
      "signup:" + authData.signup,
      async (data: DataSchema, cb: CallBack) => {
        let __key = new mongoose.Types.ObjectId().toString();
        const authCtrl = new AuthManager();
        const res = await authCtrl.signup({
          ...(await defineContext(socket, "signup", "create", data)),
          authData,
        });
        cb(res);
      }
    );
  });
};

SQuery.Schema = (description: DescriptionSchema): SQueryMongooseSchema => {
  description.__parentModel = {
    type: String,
    access: "admin",
  };
  description.__key = {
    type: Schema.Types.ObjectId,
    access: "secret",
  };

  description.__permission = {
    type: String,
    access: "secret",
  };
  description.__signupId = {
    type: String,
    access: "secret",
  };

  description.createdAt = {
    type: Number,
    access: "admin",
  };
  description.updatedAt = {
    type: Number,
    access: "admin",
  };
  description.updatedProperty = [
    {
      type: String,
      access: "secret",
    },
  ];

  const schema = new Schema(description as any);
  schema.plugin(mongoosePaginate);
  schema.plugin(mongoose_unique_validator);

  schema.pre("save", async function () {
    this.updatedAt = Date.now();
    this.modifiedPaths();
    this.updatedProperty = this.modifiedPaths();
  });

  schema.post("save", async function (doc: any) {
    //Log('save+++++++', doc.__parentModel,);
    // SQuery.emiter.when('update:' + doc._id.toString(), (val) => {
    //   Log('update:' + doc._id.toString(), val);
    // })
    let canEmit = false;
    doc.updatedProperty.forEach((p: string) => {
      const rule = description[p];
      if (Array.isArray(rule) && rule[0]?.access != 'secret') {
        canEmit = true;
      } else if (!Array.isArray(rule) && rule?.access != 'secret') {
        canEmit = true;
      }
    });

    // if(!canEmit)return;

    Global.io.emit("update:" + doc._id.toString(), {
      id: doc._id.toString(),
      doc,
      properties: doc.updatedProperty,
    });
  });

  (schema as any).description = description;
  return schema as SQueryMongooseSchema;
};

export { SQuery };
