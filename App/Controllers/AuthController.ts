import bcrypt from "bcrypt";
import { serialize } from "cookie";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { Controllers, ResponseSchema } from "../../lib/squery/Initialize";
import STATUS from "../Errors/STATUS";
import AccountModel from "../Models/AccountModel";

const generateSecret = () => {
  return crypto.randomBytes(64).toString("hex");
};
const secret = "a";

const generateToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: "19h" });
};
export default class AuthController {
  constructor() {}

  async login(ctx: ContextSchema): ResponseSchema {
    const { data, socket } = ctx;

    let account = null;
    try {
      account = await AccountModel.findOne({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      return {
        error: "ACCOUNT BAD_AUTH",
        ...(await STATUS.BAD_AUTH(ctx, {
          target: "ACCOUNT",
          message: error.message,
        })),
      };
    }

    if (!account) {
      return {
        error: "ACCOUNT BAD_AUTH",
        ...(await STATUS.BAD_AUTH(ctx, {
          target: "ACCOUNT",
        })),
      };
    }
    Log("auth-account",  account );
    const info = {
      email: account.email,
      name: account.name,
      __key: account.__key,
      __permission: account.__permission,
    };
    let cookies = {};
    let token = generateToken(info);

    let setCookies = (key: string, value: any) => {
      cookies[key] = value;
    };

    setCookies("token", token);

    socket.request.headers["set-cookie"] = serialize(
      "cookies",
      JSON.stringify(cookies));

    socket.emit("storeCookie", socket.request.headers["set-cookie"]);

    return {
      response: { userId: account.id },
      ...(await STATUS.OPERATION_SUCCESS(ctx, {
        target: "ACCOUNT",
      })),
    };
  }

  async signup(ctx: ContextSchema): ResponseSchema {
    let { data } = ctx;
    const result = await Controllers['user']()['create'](ctx)
    if (result.status) {
      return {
        error: "OPERATION_FAILED",
        ...(await STATUS.OPERATION_FAILED(ctx, {
          target: "ACCOUNT",
        })),
      };
    }

    const info = {
      email: data.email,
      name: data.name,
      id: result.response._id,
    };
 let token = ""
    return {
      response: { token },
      ...(await STATUS.OPERATION_SUCCESS(ctx, {
        target: "ACCOUNT",
      })),
    };
  }
}
