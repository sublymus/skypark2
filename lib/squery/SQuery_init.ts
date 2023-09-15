import mongoose from "mongoose";
import { authDataSchema } from "./Context";
import { ControllerCollectionInterface, ListenerPostSchema, ListenerPreSchema, ModelControllerCollectionInterface} from "./Initialize";
import { CallBack, Main, MapUserCtx, modelServiceEnabled } from "./SQueryMain";
import { Server, Socket } from "socket.io";
import Log from "sublymus_logger";
import { AuthDataMap } from "./SQuery_auth";
import { SQuery } from "./SQuery";
import { AutoExecuteDir } from "./execAuto";
import { ConfigInterface } from "./SQuery_config";

export const Local = {
  Controllers : {} as ControllerCollectionInterface,
  ModelControllers : {} as ModelControllerCollectionInterface
}
export const SQuery_init = (io: Server | null , Controllers :ControllerCollectionInterface , ModelControllers : ModelControllerCollectionInterface , config? : ConfigInterface) => {
  /********************    Cookies   *********************** */

  SQuery.IO = io;
  SQuery.Config = {...SQuery.Config, ...config};
  Local.Controllers = Controllers;
  Local.ModelControllers = ModelControllers;
  
  const setAuthValues = (authData: authDataSchema) => {
    const preCreateSignupListener: ListenerPreSchema = async ({
      ctx,
      more,
    }) => {
      // Log('Auth_debug',{authData})
      ctx.__permission = authData.__permission;
      ctx.__key = new mongoose.Types.ObjectId().toString(); ///// cle d'auth
      // Log('Auth_debug:more1',{more})
      if (more) more.__signupId = more.modelId;
      // Log('Auth_debug:more2',{more , ctx})
    };
    return preCreateSignupListener;
  };
  const setPermission: ListenerPreSchema = async ({ ctx, more }) => {
    // Log('Auth_debug:account.data',{data:ctx.data , more})
    ctx.data.__permission = ctx.authData?.__permission || ctx.__permission;
    // Log('##################',ctx.data.__permission  , ctx.authData?.__permission , ctx.__permission)
    ctx.data.__signupId = more?.__signupId;
    // Log('Auth_debug:account.data2',{data:ctx.data , more})
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
        __permission: ctx.__permission, // any non loguer, user loguer , admin loguer admin
        __signupId: more?.__signupId,
        __signupModelPath: authData.signup,
        __email: more?.modelInstance.email,
        __loginId: res.response,
        __loginModelPath: authData.login,
      };
      // Log('*******Auth_debug',{token , authData , ctx})
      await SQuery.Cookies(ctx.socket, "token", token);
    };
    return postCreateLoginListener;
  };

  let firstConnection = true;

  io?.on("connection", async (socket: Socket) => {
    if (firstConnection) {
      firstConnection = false;
      const readylist: string[] = [];

      // Log('Auth_debug',{AuthDataMap})
      for (const key in AuthDataMap) {
        // Log('Auth_debug',{key})
        if (Object.prototype.hasOwnProperty.call(AuthDataMap, key)) {
          const authData = AuthDataMap[key];
          ModelControllers[authData.signup].pre('create', setAuthValues(authData));
          if (readylist.includes(authData.login)) continue;
          //Log("init_Model_" + authData.login, authData);
          ModelControllers[authData.login].pre("create", setPermission);
          ModelControllers[authData.login].post("create", setLoginCookie(authData));
          readylist.push(authData.login);
        }
      }
      /********************    MapUserCtx  *********************** */
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
    socket.onAny((event, data, cb: CallBack) => {
      console.log({ event, data })

    });


    /********************    Models  *********************** */

    const squery = Main(socket);

    for (const ctrlName in ModelControllers) {
      if (Object.prototype.hasOwnProperty.call(ModelControllers, ctrlName)) {
        for (const service of modelServiceEnabled) {
          socket.on(ctrlName + ":" + service, squery(ctrlName, service));
        }
      }
    } /********************    Controllers  *********************** */
    for (const ctrlName in Local.Controllers) {
     // Log('Local.Controllers', Local.Controllers)
      if (Object.prototype.hasOwnProperty.call(Local.Controllers, ctrlName)) {
        const controller = Local.Controllers[ctrlName];
        for (const service in controller?.services) {
          if (Object.prototype.hasOwnProperty.call(controller?.services, service)) {
            console.log(ctrlName + ":" + service);
            
            socket.on(ctrlName + ":" + service, squery(ctrlName, service));
          }
        }
      }
    }
  }
  );
  setTimeout(() => {
    AutoExecuteDir(SQuery.Config);
  });

  return io;
};