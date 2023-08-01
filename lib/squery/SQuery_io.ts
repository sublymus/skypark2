import mongoose from "mongoose";
import { authDataSchema } from "./Context";
import { Controllers, ListenerPostSchema, ListenerPreSchema, ModelControllers } from "./Initialize";
import { AllowedModelService, CallBack, Global, MapUserCtx, SQuery, modelServiceEnabled } from "./SQuery";
import { Server, Socket } from "socket.io";
import Log from "sublymus_logger";
import { AuthDataMap } from "./SQuery_auth";
import { Config } from "./Config";

export const SQuery_io = (httpServer: any) => {
    /********************    Cookies   *********************** */
    if (!httpServer) {
      return Global.io;
    }
    const io = new Server(httpServer, {
      maxHttpBufferSize: 1e10,
      cors:Config.conf.IO_CORS,
      cookie: {
        name: "io",
        path: "/",
        httpOnly: false,
        sameSite: "lax",
      },
    });
    Global.io = io;
    
    const setAuthValues = (authData: authDataSchema) => {
      const preCreateSignupListener: ListenerPreSchema = async ({
        ctx,
        more,
      }) => {
        Log('Auth_debug',{authData})
        ctx.__permission = authData.__permission;
        ctx.__key = new mongoose.Types.ObjectId().toString(); ///// cle d'auth
        Log('Auth_debug:more1',{more})
        if(more)more.__signupId = more.modelId;
        Log('Auth_debug:more2',{more , ctx})
      };
      return preCreateSignupListener;
    };
    const setPermission: ListenerPreSchema = async ({ ctx, more }) => {
      Log('Auth_debug:account.data',{data:ctx.data , more})
      ctx.data.__permission = ctx.authData?.__permission|| ctx.__permission;
      Log('##################',ctx.data.__permission  , ctx.authData?.__permission , ctx.__permission)
      ctx.data.__signupId = more?.__signupId;
      Log('Auth_debug:account.data2',{data:ctx.data , more})
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
        Log('*******Auth_debug',{token , authData , ctx})
        await SQuery.cookies(ctx.socket, "token", token);
      };
      return postCreateLoginListener;
    };
  
    let firstConnection = true;
  
    io.on("connection", async (socket: Socket) => {
      if (firstConnection) {
        firstConnection = false;
        const readylist:string[] = [];

        Log('Auth_debug',{AuthDataMap})
        for (const key in AuthDataMap) {
          Log('Auth_debug',{key})
          if (Object.prototype.hasOwnProperty.call(AuthDataMap, key)) {
            const authData = AuthDataMap[key];
            const signupCtrl = ModelControllers[authData.signup]();
            ModelControllers[authData.signup].pre(signupCtrl.create ? 'create' : 'store', setAuthValues(authData));
            if (readylist.includes(authData.login)) continue;
            //Log("init_Model_" + authData.login, authData);
            const loginCtrl = ModelControllers[authData.login]();
            ModelControllers[authData.login].pre(loginCtrl.create ? "create" : 'store', setPermission);
            ModelControllers[authData.login].post(loginCtrl.create ? "create" : 'store', setLoginCookie(authData));
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
  
      const squery = SQuery(socket);
     
      for (const ctrlName in ModelControllers) {
        if (Object.prototype.hasOwnProperty.call(ModelControllers, ctrlName)) {
          for (const service of  modelServiceEnabled) {
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
              socket.on(ctrlName + ":" + service, squery(ctrlName, service as AllowedModelService));
            }
          }
        }
      }
    }
    );
    Global.io = io;
    return io;
  };
  