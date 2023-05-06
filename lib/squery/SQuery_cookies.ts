import { SQuery } from "./SQuery";
import { parse, serialize } from "cookie";
import jwt from "jsonwebtoken";
import { Config } from "./Config";
import Log from "sublymus_logger";

export const SQuery_cookies = async (socket, key: string, value?: any) => {
    let decoded: any = {};
    let cookie = socket.request.headers.cookie;
    try {
      const squery_session = JSON.parse(parse(cookie).squery_session);
      decoded = jwt.verify(squery_session, Config.conf.TOKEN_KEY) || {};
    } catch (error) {
      Log("jwtError", error.message);
    }
    if (key && value) decoded[key] = value;
    if (!key && !value) return decoded;
    if (!value) return decoded[key];
  
    const generateToken = (payload: { [property: string]: any }) => {
      return jwt.sign(
        {
          ...payload,
        },
        Config.conf.TOKEN_KEY
      );
    };
  
    let token = generateToken(decoded);
    const cookieToken = serialize("squery_session", JSON.stringify(token), {
      maxAge: Date.now() + 24 * 60 * 60 * 1000,
    });
  
    return await new Promise((rev) => {
      socket.emit("storeCookie", cookieToken, (clientCookie: string) => {
        socket.request.headers.cookie =
          ((socket.request.headers.cookie as string) || "")
            .split(";").filter((part: string) => {
              part = part.trim();
              return !part.startsWith("squery_session");
            }).join("; ") + "; " + cookieToken;
        rev(clientCookie);
      });
    });
  };
  