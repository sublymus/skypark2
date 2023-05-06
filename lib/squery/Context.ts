import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

type MoreProperty = {
  [p: string]: any;
};

export type AuthExtensionSchema = {
  new(): {
    [str: string]: any;
    confirm: (ctx: ContextSchema) => Promise<boolean>;
    error: () => string;
  };
};
export type authDataOptionSchema = {
  login: string;
  match: string[];
  signup: string;
  extension?: AuthExtensionSchema[];
};
export type authDataSchema = authDataOptionSchema & {
  __permission: string,
};
export type DataSchema = {
  [p: string]: any;
};

export type ContextSchema = {
  ctrlName: string,
  service: string,
  data: DataSchema,
  socket: Socket,
  signup:{
    modelPath:string,
    id:string
  },
  login: {
    modelPath: string,
    id: string
  }
  __key: string, /// pour le moment data.__key = cookies[__key]
  __permission: string
} & MoreProperty;


