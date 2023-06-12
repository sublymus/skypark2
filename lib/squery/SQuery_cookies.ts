import { parse, serialize } from "cookie";
import jwt from "jsonwebtoken";
import Log from "sublymus_logger";
import { Config } from "./Config";
import { Server, Socket } from "socket.io";

export const SQuery_cookies = async (source:Socket|null|string, key?: string, value?: any) => {
  let decoded: any = {};
  let cookie = typeof source =='string'? source : source?.request.headers.cookie;
  try {
    const squery_session = JSON.parse(parse(cookie||'').squery_session);
    decoded = jwt.verify(squery_session, Config.conf.TOKEN_KEY||'') || {};
  } catch (error:any) {
    Log("jwtError", error.message);
  }
  if (key && value) decoded[key] = value;
  if (!key && !value) return decoded;
  if (!value && key) return decoded[key];
  if (value && !key) return;

  if(!(source instanceof Socket)) return key? decoded[key]:undefined;
  console.log('on est passer');
  ('on est passer')
  const socket = source;
  const generateToken = (payload: { [property: string]: any }) => {
    return jwt.sign(
      {
        ...payload,
      },
      Config.conf.TOKEN_KEY||''
    );
  };

  let token = generateToken(decoded);
  const cookieToken = serialize("squery_session", JSON.stringify(token), {
    maxAge: Date.now() + 24 * 60 * 60 * 1000,
  });

  
  return await new Promise((rev) => {
    socket.emit("storeCookie", cookieToken, (clientCookie: string) => {
      try {
        Log('koki',socket.request.headers.cookie)
        socket.request.headers.cookie =
          ((socket.request.headers.cookie as string) || "")
            .split(";")
            .filter((part: string) => {
              part = part.trim();
              return !part.startsWith("squery_session");
            })
            .join("; ") +
          "; " +
          cookieToken;
      } catch (error) {
        Log('ERROR_COOKIES',{ error });
        rev(null);
      }
      rev(clientCookie);
    });
  });
};
