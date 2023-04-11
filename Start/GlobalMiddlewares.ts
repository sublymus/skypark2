import Log from "sublymus_logger";
import { ContextSchema } from "../lib/squery/Context";
import { GlobalMiddlewares } from "../lib/squery/Initialize";
import { SQuery } from "../lib/squery/SQuery";

GlobalMiddlewares.push(async (ctx: ContextSchema) => {

  try {
    const token = await SQuery.cookies(ctx.socket, 'token');
    //Log('GlobalMiddlewares', { token })
    ctx.__key = token.__key;
    ctx.__permission = token.__permission || 'any';
  } catch (error) {
    Log("GlobalMiddlewares_jwtError", error.message);
  }

});
