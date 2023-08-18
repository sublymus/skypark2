import mongoose from "mongoose";
import Log from "sublymus_logger";
import { AuthManager } from "./AuthManager";
import { DataSchema, authDataOptionSchema, authDataSchema } from "./Context";
import { CallBack, SQuery, defineContext } from "./SQuery";

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
export const SQuery_auth = (authDataOption: authDataOptionSchema) => {
  const authData: authDataSchema = {
    ...authDataOption,
    __permission: `client:${authDataOption.signup}`,
  };
  authData.match.push("__permission");
  AuthDataMap[authData.signup] = authData;
  Log('AuthDataMap',{AuthDataMap})
  SQuery.io()?.on("connection", (socket: any) => {
    socket.on(
      `login:${authData.signup}`,
      async (data: DataSchema, cb: CallBack) => {
        data = data || {};
        data.__permission = authData.__permission;
        Log('__permission',data.__permission)
        const authCtrl = new AuthManager();
        const res = await authCtrl.login({
          ...(await defineContext(socket, "login", "read", {})),
          data,
          authData,
        });
        cb?.(res);
      }
    );
    socket.on(
      `signup:${authData.signup}`,
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
