import Log from "sublymus_logger";
import { ContextSchema, authDataSchema } from "./Context";
import STATUS from "./Errors/STATUS";
import { ControlSchema, ControllerSchema, ModelControllerSchema, ModelControllers, ResponseSchema } from "./Initialize";
import { SQuery } from "./SQuery";

export class AuthManager {
  login = async (ctx: ContextSchema): ResponseSchema => {
    const { data, socket, authData } = ctx;
    if (!authData) {
      return {
        error: "OPERATION_FAILED",
        ...(await STATUS.OPERATION_FAILED(ctx)),
      };
    }
    let loginModelInstance = null;
    Log("login", ctx.data);
    //console.log('login',ctx.data);

    try {
      let filter: any = {};
      authData.match.forEach((property) => {
        if (!data[property])
          throw new Error(
            "ILLEGAL_ARGUMEMNT property <" +
              property +
              "> = " +
              data[property] +
              ";"
          );

        filter[property] = data[property];
      });
      
      
      
      loginModelInstance = await ModelControllers[
        authData.login
      ].option?.model.findOne({
        "email": "m@gmail.com",
        "password": "azert",
      });




      Log("loginModelInstance", loginModelInstance);





    } catch (error:any) {
      Log("ERROR_loginModelInstance", error);
      //  console.log('ERROR_loginModelInstance', error);
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
    try {
      authData.loginExtension = authData.loginExtension || [];
      for (let i = 0; i < authData.loginExtension.length; i++) {
        const Ext = authData.loginExtension[i];
        const ext = new Ext();

        let confirmed = await ext.confirm(ctx);

        if (!confirmed) {
          throw new Error(ext.error());
        }
      }
    } catch (error:any) {
      return {
        error: "OPERATION FAILED",
        ...(await STATUS.OPERATION_FAILED(ctx, {
          target: authData.signup.toLocaleUpperCase(),
          message: error,
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

    Log("AVANT_LE_cookies", {
      modelPath: token.__loginModelPath,
      id: token.__loginId,
    });
    await SQuery.cookies(socket, "token", token);

    Log("APLE_cookies", {
      modelPath: token.__loginModelPath,
      id: token.__loginId,
    });

    return {
      response: {
        login: {
          modelPath: token.__loginModelPath,
          id: token.__loginId,
        },
        signup: {
          modelPath: token.__signupModelPath,
          id: token.__signupId,
        },
      },
      ...(await STATUS.OPERATION_SUCCESS(ctx, {
        target: authData.login.toLocaleUpperCase(),
      })),
    };
  };

  signup = async (ctx: ContextSchema): ResponseSchema => {
    let { authData } = ctx;
    if (!authData) {
      return {
        error: "OPERATION_FAILED",
        ...(await STATUS.OPERATION_FAILED(ctx)),
      };
    }
    try {
      authData.signupExtension = authData.signupExtension || [];
      for (let i = 0; i < authData.signupExtension.length; i++) {
        const Ext = authData.signupExtension[i];
        const ext = new Ext();

        let confirmed = await ext.confirm(ctx);

        if (!confirmed) {
          throw new Error(ext.error());
        }
      }
    } catch (error:any) {
      return {
        error: "OPERATION FAILED",
        ...(await STATUS.OPERATION_FAILED(ctx, {
          target: authData.signup.toLocaleUpperCase(),
          message: error,
        })),
      };
    }
    const more: any = {};
    const ctrl =  ModelControllers[authData.signup]();
    const res =  await (ctrl.create || ctrl.store)?.(ctx, more);
    Log("ici", res);
    if (!res?.response) {
      return {
        error: "OPERATION_FAILED",
        ...(await STATUS.OPERATION_FAILED(ctx, {
          target: authData.signup.toLocaleUpperCase(),
          message: res?.error,
        })),
      };
    }
    return res;
  };
}
