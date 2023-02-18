import { ContextSchema } from "../../lib/squery/Context";

export default class ReadingAccess {
  static async reading(ctx: ContextSchema) {
    ctx.I_See_You = true;
  }
  static async ert(ctx: ContextSchema) {
    ctx.I_See_You = true;
  }
  static async uhewd(ctx: ContextSchema) {
    ctx.I_See_You = true;
  }
  static async pretty(ctx: ContextSchema) {
    ctx.You_Are_Pretty_Girl = true;
  }
}
