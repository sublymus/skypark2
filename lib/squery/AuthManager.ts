import { parse, serialize } from "cookie";

import jwt from "jsonwebtoken";
import Log from "sublymus_logger";
import STATUS from "../../App/Errors/STATUS";
import { ContextSchema, authDataSchema } from "./Context";
import { ModelControllers, ResponseSchema } from "./Initialize";

const secret = "a";
const generateToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: "19h" });
};

export class AuthManager {

  login = async (ctx: ContextSchema): ResponseSchema => {
    const { data, socket, authData: authDataAny } = ctx;
    const authData: authDataSchema = authDataAny;
    let loginModelInstance = null;
    try {
      let filter: any = {};
      authData.match.forEach((property) => {
        if (!data[property]) throw new Error('ILLEGAL_ARGUMEMNT property <' + property + '> = ' + data[property] + ';');

        filter[property] = data[property];
      });
      Log("oops", filter)
      loginModelInstance = await ModelControllers[authData.login].option.model.findOne(filter);
      Log('loginModelInstance', loginModelInstance)
    } catch (error) {
      Log('loginModelInstance', error)
      return {
        error: `${authData.login.toLocaleUpperCase()} BAD_AUTH`,
        ...(await STATUS.BAD_AUTH(ctx, {
          target: authData.login.toLocaleUpperCase(),
          message: error.message,
        })),
      };
    }

    if (!loginModelInstance) {
      return {
        error: `${authData.login} NOT FOUND`,
        ...(await STATUS.NOT_FOUND(ctx, {
          target: authData.login.toLocaleUpperCase(),
        })),
      };
    }

    const info = {
      __key: loginModelInstance.__key,
      __permission: authData.__permission,
    };

    await AuthManager.cookiesInSocket(info, socket);
    return {
      response: { loginId: loginModelInstance.id, modelPath: authData.login },
      ...(await STATUS.OPERATION_SUCCESS(ctx, {
        target: authData.login.toLocaleUpperCase(),
      })),
    };
  };

  signup = async (ctx: ContextSchema): ResponseSchema => {
    let { socket, authData: authDataAny } = ctx;
    const authData: authDataSchema = authDataAny;
    try {
      authData.extension = authData.extension || [];
      for (let i = 0; i < authData.extension.length; i++) {
        const Ext = authData.extension[i];
        const ext = new Ext();
        let confirmed = await ext.confirm(ctx);

        if (!confirmed) {
          throw new Error(ext.error());
        }
      }
    } catch (error) {
      return {
        error: 'OPERATION FAILED',
        ...(await STATUS.OPERATION_FAILED(ctx, {
          target: authData.signup.toLocaleUpperCase(),
          message: error
        })),
      };
    }
    const result = await ModelControllers[authData.signup]()["create"](ctx);
    Log("ici", result)
    if (result.error) {
      return {
        error: "OPERATION_FAILED",
        ...(await STATUS.OPERATION_FAILED(ctx, {
          target: authData.signup.toLocaleUpperCase(),
          message: result.error
        })),
      };
    }
    const info = {
      __key: ctx.__key,
      __permission: authData.__permission, // any non logue, user logue , admin logue admin
    };
    AuthManager.cookiesInSocket(info, socket);

    return result
  };

  static async cookiesInSocket(info: { __key: string, __permission: string }, socket) {
    //let cookies = {};
    let token = generateToken(info);

    socket.request.headers["set-cookie"] = serialize("token", JSON.stringify(token), {
      maxAge: Date.now() + 24 * 60 * 60 * 1000,
    });

    console.log(socket.request.headers.cookie);

    await new Promise((rev, rej) => {
      socket.emit("storeCookie", socket.request.headers.cookie, (cookie: string) => {
        const token = JSON.parse(parse(cookie).token);
        //let token = c?.token;
        const decoded = jwt.verify(token, "a");
        Log("storeCookie", { decoded })
        rev(true);
      });
    })
  }
}
