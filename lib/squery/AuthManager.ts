
import Log from "sublymus_logger";
import STATUS from "../../App/Errors/STATUS";
import { ContextSchema, authDataSchema } from "./Context";
import { ModelControllers, ResponseSchema } from "./Initialize";
import { SQuery } from "./SQuery";

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

    const token = {
      __key: loginModelInstance.__key,
      __permission: authData.__permission,
      __loginId: loginModelInstance._id.toString(),
      __loginModelPath: authData.login,
      __email: loginModelInstance.email,
      __signupModelPath: authData.signup,
      __signupId: loginModelInstance.__signupId.toString(),
    };

    await SQuery.cookies(socket, 'token', token);
    return {
      response: {
        login: {
          modelPath: token.__loginModelPath,
          id: token.__loginId,
        },
        signup: {
          modelPath: token.__signupModelPath,
          id: token.__signupId
        }
      },
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
    const more: any = {};
    const res = await ModelControllers[authData.signup]()["create"](ctx, more);
    Log("ici", res)
    if (res.error) {
      return {
        error: "OPERATION_FAILED",
        ...(await STATUS.OPERATION_FAILED(ctx, {
          target: authData.signup.toLocaleUpperCase(),
          message: res.error
        })),
      };
    }

    //AuthManager.cookiesInSocket(info, socket);

    return res
  };

}
