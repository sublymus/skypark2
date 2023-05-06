import { ContextSchema } from "../../lib/squery/Context";
import { StatusSchema } from "../../lib/squery/Initialize";
import Message from "./Message";
type OptionShema = {
  message?: string,
  target?: string,
  log?: (Satut: any) => void
};

const STATUS = {
  async BAD_AUTH(ctx: ContextSchema, option?: OptionShema) {
    return await BuildSatut(ctx, this.BAD_AUTH, 200, option);
  },
  async BAD_AUTH_SOUCIES(ctx: ContextSchema, option?: OptionShema) {
    return await BuildSatut(ctx, this.BAD_AUTH_SOUCIES, 200, option);
  },
  async NOT_DELETED(ctx: ContextSchema, option?: OptionShema) {
    return await BuildSatut(ctx, this.NOT_DELETED, 201, option);
  },
  async DELETED(ctx: ContextSchema, option?: OptionShema) {
    return await BuildSatut(ctx, this.DELETED, 204, option);
  },
  async NOT_FOUND(ctx: ContextSchema, option?: OptionShema) {
    return await BuildSatut(ctx, this.NOT_FOUND, 200, option);
  },
  async UPDATE(ctx: ContextSchema, option?: OptionShema) {
    return await BuildSatut(ctx, this.UPDATE, 204, option);
  },
  async CREATED(ctx: ContextSchema, option?: OptionShema) {
    return await BuildSatut(ctx, this.CREATED, 204, option);
  },
  async NOT_CREATED(ctx: ContextSchema, option?: OptionShema) {
    return await BuildSatut(ctx, this.NOT_CREATED, 204, option);
  },
  async OPERATION_SUCCESS(ctx: ContextSchema, option?: OptionShema) {
    return await BuildSatut(ctx, this.OPERATION_SUCCESS, 204, option);
  },
  async OPERATION_FAILED(ctx: ContextSchema, option?: OptionShema) {
    return await BuildSatut(ctx, this.OPERATION_FAILED, 204, option);
  },

};

async function BuildSatut(
  ctx: ContextSchema,
  code: string | Function,
  status: number,
  option?: OptionShema,
): Promise<StatusSchema> {
  code = typeof code === "string" ? code : code.name;
  let m = await Message(ctx, code);
  m = (option?.target ? option?.target + " " : "") + m;
  const message = (option?.message ? option?.message + " " : '')
  const statut = { code, message: m + " => " + message, status };
  // ctx.response.status(status);
  option?.log?.(statut);
  return statut;
}
export default STATUS;
