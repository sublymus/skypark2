import { parse } from "cookie";
import jwt from "jsonwebtoken";
import Log from "sublymus_logger";
import { ContextSchema } from "../lib/squery/Context";
import { GlobalMiddlewares } from "../lib/squery/Initialize";

GlobalMiddlewares.push(async (ctx: ContextSchema) => {
  if (
    !(
      ctx.action === "create" &&
      (ctx.modelPath === "user" || ctx.modelPath === "manager")
    )
  ) {
    try {
      let cookies = ctx.socket.request.headers[
        "set-cookie"
      ] as unknown as string;
      Log("oops", cookies)
      let cookie = JSON.parse(parse(cookies).cookies);
      let token = cookie?.token;
      const decoded: any = jwt.verify(token, "a");
      Log("oops", {decoded})
      ctx.__key = decoded.__key;
      ctx.__permission = decoded.__permission;
    } catch (error) {
      Log("jwtError", error);
    }
  }
});
