import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { DataSchema } from "./SQuery";

type MoreProperty = {
  [p: string]: any;
};

export type tokenShema = {
  id: string,
  email?: string
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


