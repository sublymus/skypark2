import Log from "sublymus_logger";
import { ContextSchema } from "../lib/squery/Context";
import { GlobalMiddlewares } from "../lib/squery/Initialize";
import { MapUserCtx, SQuery } from "../lib/squery/SQuery";

GlobalMiddlewares.push(async (ctx: ContextSchema) => {

  try {
   
  } catch (error) {
    Log("GlobalMiddlewares_jwtError", error.message);
  }

});
