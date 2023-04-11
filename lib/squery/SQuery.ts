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
import { ContextSchema, authDataOptionSchema, authDataSchema } from "./Context";
import { Controllers, DescriptionSchema, GlobalMiddlewares, ListenerPostSchema, ListenerPreSchema, ModelControllers, ResultSchema, SQueryMongooseSchema } from "./Initialize";

export type FirstDataSchema = {
  __action: "create" | "read" | "list" | "update" | "delete";
  [p: string]: any;
};
const avalaibleModelAction = ['create', 'read', 'list', 'update', 'delete']
type CallBack = (...arg: any) => any;

type SQuerySchema = Function & {
  io: (server: any) => Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  Schema: (description: DescriptionSchema) => any,
  auth: (authData: authDataOptionSchema) => void,
  cookies(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, key?: string, value?: any): Promise<any>
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
        __permission: "any", ///  data.__permission = undefined
      };

      const midList = [...GlobalMiddlewares];

      for (let i = 0; i < midList.length; i++) {
        const res = await midList[i](ctx);

        if (res !== undefined) return cb?.(res);
      }

      let res: ResultSchema = null;
      try {
        if (modelRequest) {
          res = await ModelControllers[ctrlName.replace('model_', '')]?.()[action]?.(ctx);
        } else {
          res = await Controllers[ctrlName]?.()[action]?.(ctx);
        }
      } catch (error) {
        Log('ERROR_Controller', error.message);
        return cb?.({
          error: "CURRENT_USER_UNDEFINED",
          status: 404,
          code: "CURRENT_USER_UNDEFINED",
          message: "CURRENT_USER_UNDEFINED",
        });
      }

      if (res === undefined) {
        return cb?.({
          error: "NOT_FOUND",
          status: 404,
          code: "UNDEFINED",
          message: "access not found for Path: " + ctrlName + '.' + action,
        });
      }
      // Log('res', res)
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

SQuery.cookies = async (socket, key: string, value?: any) => {

  let decoded: any = {};
  try {
    let cookie = socket.request.headers.cookie;
    //Log('SQuery.cookies_parse', JSON.parse(parse(cookie).squery_session));
    // Log('SQuery.cookies_parse', parse(cookie));
    // Log('SQuery.cookies_parse', cookie);
    const squery_session = JSON.parse(parse(cookie).squery_session);
    decoded = jwt.verify(squery_session, Config.KEY) || {};
  } catch (error) {
    Log("jwtError", error.message);
  }
  // /Log('decoded', { decoded });
  if (key && value) decoded[key] = value;
  if (!value) return decoded[key];
  if (!key && !value) return decoded;

  const generateToken = (payload: { [property: string]: any }) => {
    return jwt.sign({
      ...payload,
      //iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000,
    }, Config.KEY);
  };

  let token = generateToken(decoded);

  const cookieToken = serialize('squery_session', JSON.stringify(token), {
    maxAge: Date.now() + 24 * 60 * 60 * 1000,
  });

  return await new Promise((rev) => {
    socket.emit("storeCookie", cookieToken, (clientCookie: string) => {
      socket.request.headers.cookie = ((socket.request.headers.cookie as string) || '').split(';').filter((part: string) => {
        part = part.trim();
        return !part.startsWith('squery_session');
      }).join('; ') + "; " + cookieToken;
      rev(clientCookie);
    });
  })
}

SQuery.io = (server: any) => {
  /********************    Cookies   *********************** */

  const io = new Server(server, {
    cookie: {
      name: "io",
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    }
  });
  Global.io = io;
  const setPermission: ListenerPreSchema = async ({ ctx, more }) => {
    ctx.data.__permission = ctx.__permission;
    ctx.data.__signupId = more.__signupId;
    Log('setPermission', { data: ctx.data });
  }
  const setAuthValues = (authData: authDataSchema) => {
    const preCreateSignupListener: ListenerPreSchema = async ({ ctx, more }) => {
      ctx.__permission = authData.__permission
      ctx.__key = new mongoose.Types.ObjectId().toString(); ///// cle d'auth
      more.__signupId = more.modelId;
      Log('preCreateSignupListener', ctx.data);
    }
    return preCreateSignupListener;
  }

  const setLoginCookie = (authData: authDataSchema) => {
    const postCreateLoginListener: ListenerPostSchema = async ({ ctx, more, res }) => {
      if (res.error) return Log('Giga_ERROR', res);
      const token = {
        __key: ctx.__key,
        __permission: authData.__permission, // any non loguer, user loguer , admin loguer admin
        __signupId: more.__signupId,
        __signupModelPath: authData.signup,
        __email: more.modelInstance.email,
        __loginId: res.response,
        __loginModelPath: authData.login
      };
      Log('postCreateLoginListener', { token });
      await SQuery.cookies(ctx.socket, 'token', token);
    }
    return postCreateLoginListener;
  }

  let firstConnection = true;
  io.on("connection", async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    if (firstConnection) {
      firstConnection = false;
      const readylist = []
      for (const key in AuthDataMap) {
        if (Object.prototype.hasOwnProperty.call(AuthDataMap, key)) {
          const authData = AuthDataMap[key];
          ModelControllers[authData.signup].pre('create', setAuthValues(authData));
          ModelControllers[authData.signup].pre('store', setAuthValues(authData));
          if (readylist.includes(authData.login)) continue;
          Log('init_Model_' + authData.login, authData);
          ModelControllers[authData.login].pre('create', setPermission);
          ModelControllers[authData.login].pre('store', setPermission);
          ModelControllers[authData.login].post('create', setLoginCookie(authData));
          ModelControllers[authData.login].post('store', setLoginCookie(authData));
          readylist.push(authData.login);
        }
      }
    }
    /********************    Models  *********************** */
    socket.onAny((event, ...args) => {
      //Log('any', { event }, ...args)
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
export const AuthDataMap: { [p: string]: authDataSchema } = {}
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
    __permission: "user:" + authDataOption.signup
  };
  authData.match.push("__permission");
  AuthDataMap[authData.signup] = authData;


  Global.io.on("connection", (socket: any) => {
    socket.on("login:" + authData.signup, async (data, cb) => {
      data.__permission = authData.__permission;
      const authCtrl = new AuthManager();
      const res = await authCtrl.login({
        ctrlName: 'login',
        data,
        __key: "",
        __permission: authData.__permission,
        action: "read",
        socket,
        authData
      });
      cb(res);
    });
    socket.on("signup:" + authData.signup, async (data, cb) => {

      let __key = new mongoose.Types.ObjectId().toString();
      const authCtrl = new AuthManager();
      const res = await authCtrl.signup({
        ctrlName: 'signup',
        action: "create",
        data,
        __key,
        __permission: authData.__permission,
        socket,
        authData
      });
      cb(res);
    });
  });
};



SQuery.Schema = (description: DescriptionSchema): SQueryMongooseSchema => {
  description.__parentModel = {
    type: String,
    access: 'admin',
  }
  description.__key = {
    type: Schema.Types.ObjectId,
    required: true,
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
    type: Date,
    default: Date.now(),
    access: 'admin'
  }
  description.updatedAt = {
    type: Date,
    default: Date.now(),
    access: 'admin',
  }
  description.updatedProperty = [{
    type: String,
    access: 'secret',
  }];


  const schema = new Schema(description as any);
  schema.plugin(mongoosePaginate);
  schema.plugin(mongoose_unique_validator);

  schema.pre('save', async function () {
    this.updatedAt = Date.now();
    this.modifiedPaths();
    this.updatedProperty = this.modifiedPaths();

  });

  schema.post('save', async function (doc: any) {
    //emettre dans  les room dedier
    //Log('cache', doc)
    Global.io.emit('update:' + doc._id.toString(), {

      id: doc._id.toString(),
      doc,
      properties: doc.updatedProperty,
    })
  });

  (schema as any).description = description;
  return schema as SQueryMongooseSchema;
}
export { SQuery };
