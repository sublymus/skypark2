import { parse } from "cookie";
import jwt from "jsonwebtoken";
import Log from "sublymus_logger";
import { ContextSchema } from "../lib/squery/Context";
import { GlobalMiddlewares } from "../lib/squery/Initialize";

GlobalMiddlewares.push(async (ctx: ContextSchema) => {

  try {
    let cookie = ctx.socket.request.headers.cookie;
    let decoded: any = {};
    const token = JSON.parse(parse(cookie).token);
    //let token = c?.token;
    decoded = jwt.verify(token, "a") || {};
    ctx.__key = decoded.__key;
    ctx.__permission = decoded.__permission || 'any';
    Log('decoded', { decoded })
  } catch (error) {
    Log("jwtError", error);
  }

});
