import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import Log from "sublymus_logger";
import STATUS from "../../App/Errors/STATUS";
import { ContextSchema } from "./Context";
import { ModelControllers, ResponseSchema } from "./Initialize";

const secret = "a";
const generateToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: "19h" });
};

export class AuthManager {

  login = async (ctx: ContextSchema): ResponseSchema => {
    const { data, socket, authData } = ctx;
    let loginModelInstance = null;
    try {
      let filter: any = {};
      authData.match.forEach((property) => {
        filter[property] = data[property];
      });
      Log("oops", filter)
      Log('model', ModelControllers[authData.login])
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
      __permission: 'user',
    };

    this.#cookiesInSocket(info, socket);
    return {
      response: { loginId: loginModelInstance.id, modelPath: authData.login },
      ...(await STATUS.OPERATION_SUCCESS(ctx, {
        target: authData.login.toLocaleUpperCase(),
      })),
    };
  };

  signup = async (ctx: ContextSchema): ResponseSchema => {
    let { socket, authData } = ctx;

    try {

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
      __permission: 'user', // any non logue, user logue , admin logue admin
    };
    this.#cookiesInSocket(info, socket);

    return result
  };

  #cookiesInSocket(info: any, socket) {
    let cookies = {};
    let token = generateToken(info);

    let setCookies = (key: string, value: any) => {
      cookies[key] = value;
    };

    setCookies("token", token);

    socket.request.headers["set-cookie"] = serialize(
      "cookies",
      JSON.stringify(cookies),
      {
        name: "io",
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        maxAge: Date.now() + 24 * 60 * 60 * 1000,
      }
    );

    socket.emit("storeCookie", socket.request.headers["set-cookie"]);
  }
}
