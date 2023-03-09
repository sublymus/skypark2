import STATUS from "../../App/Errors/STATUS";
import { ContextSchema } from "./Context";
import { Controllers, ResponseSchema } from "./Initialize";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import Log from "sublymus_logger";

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
      //Log("oops", filter)
      loginModelInstance = await Controllers[
        authData.login
      ].option.model.findOne(filter);
    } catch (error) {
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
      __permission: loginModelInstance.__permission,
    };

    this.#cookiesInSocket(info, socket);
    return {
      response: { loginId: loginModelInstance.id , modelPath : authData.login },
      ...(await STATUS.OPERATION_SUCCESS(ctx, {
        target: authData.login.toLocaleUpperCase(),
      })),
    };
  };

  signup = async (ctx: ContextSchema): ResponseSchema => {
    let { socket ,authData } = ctx;

    for (let i = 0; i < authData.extension.length; i++) {
      const ext = authData.extension[i];
      const Ext = new ext();
      let A1 = await Ext.confirm(ctx);

      if (!A1) {
        return {
          error: 'OPERATION FAILED',
          ...(await STATUS.OPERATION_FAILED(ctx, {
            target: authData.signup.toLocaleUpperCase(),
            message :  Ext.error()
          })),
        };
      }
    }
    const result = await Controllers[authData.signup]()["create"](ctx);
   // Log("ici", result)
    if (result.error) {
      return {
        error: "OPERATION_FAILED",
        ...(await STATUS.OPERATION_FAILED(ctx, {
          target: authData.signup.toLocaleUpperCase(),
        })),
      };
    }
    const info = {
      __key: ctx.__key ,
      __permission: 'user',
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
      JSON.stringify(cookies)
    );

    socket.emit("storeCookie", socket.request.headers["set-cookie"]);
  }
}
