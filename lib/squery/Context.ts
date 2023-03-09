import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { DataSchema } from "./SQuery";

type MoreProperty = {
  [p: string]: any;
};

export type AuthExtensionSchema = {
  new (): {
    [str : string]  :  any;
    confirm: (ctx: ContextSchema) => Promise<boolean>;
    error: () => string;
  };
};
export type authDataSchema = {
  login: string;
  match: string[];
  signup: string;
  extension?: AuthExtensionSchema[];
};
export type ContextSchema = {
  //token: tokenShema,
  data: DataSchema,
  modelPath: string,
  action: 'create' | 'read' | 'update' | 'delete',
  socket: Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  >,
  __key: string, /// pour le moment data.__key = cookies[__key]
  __permission: 'user' | 'admin' | 'global'
} & MoreProperty;


