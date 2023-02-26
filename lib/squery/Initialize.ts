
import mongoose from 'mongoose';
import { StatusSchema } from "../../App/Errors/STATUS";
import { ContextSchema } from "./Context";
import './execAuto';

export const AloFiles = {
  files: null,
};

export type ErrorCaseSchema = {
  response?: any;
  error: any;
};

export type successCaseSchema = {
  response: any;
  error?: any;
};
export type RestSchema = (successCaseSchema | ErrorCaseSchema) & StatusSchema;
export type ResponseSchema = Promise<RestSchema>;

export type MiddlewareSchema = (
  context: ContextSchema
) => ResponseSchema | Promise<void | undefined>;

export type GlobalMiddlewareSchema = MiddlewareSchema[];

export type MiddlewaresConfig = {
  [p: string]: {
    create?: MiddlewareSchema[];
    read?: MiddlewareSchema[];
    update?: MiddlewareSchema[];
    delete?: MiddlewareSchema[];
  };
};
export type MoreSchema = {
  [p: string]: any;
  savedlist?: savedSchema[];
  modelPath?: string;
  modelInstance?: any
};
export type ControlSchema = (
  context: ContextSchema,
  more?: MoreSchema
) => ResponseSchema;
export type ControllerSchema = {
  create?: ControlSchema;
  read?: ControlSchema;
  update?: ControlSchema;
  delete?: ControlSchema;
  store?: ControlSchema;
  show?: ControlSchema;
  write?: ControlSchema;
  destroy?: ControlSchema;
};
export type EventSting = "create" | "store" | "read" | "update" | "delete" | "destroy";

export type EventPreSchema = { ctx: ContextSchema; more?: MoreSchema; event?: string };

export type EventPostSchema = {
  ctx: ContextSchema;
  more?: MoreSchema;
  res: RestSchema;
  event: string;
};

export type ListenerPreSchema = (e: EventPreSchema) => void;

export type ListenerPostSchema = (e: EventPostSchema) => void;

export type CtrlMakerSchema = (() => ControllerSchema) & {
  option?: From_optionSchema;
  pre?: (event: EventSting, listener: ListenerPreSchema) => void;
  post?: (event: EventSting, listener: ListenerPostSchema) => void;
};

export type ControllersConfig = {
  [p: string]: CtrlMakerSchema;
};

export type From_optionSchema = {
  schema: unknown & {
    paths: {
      [p: string]: {
        instance: string;
        options?: {
          ref?: string;
        };
      };
    };
   obj:{
    [p:string]:any
   }
  };
  model: any;
  modelPath: string;
  volatile: boolean;
  access?: "public" | "share" | "admin" | "secret";
};
export type savedSchema = {
  modelId: string;
  __key: string;
  volatile: boolean;
  controller: ControllerSchema;
};
export type FilterSchema = {
  [p: string]: any;
};
export type PopulateSchema = {
  path?: string;
  model?: string;
  match?: FilterSchema;
  select?: string;
  perDocumentLimit?: number;
  option?: {
    limite: number;
    sort: {};
  };
  populate?: PopulateAllSchema;
};

export type PopulateAllSchema = PopulateSchema[];
export type ModelInstanceSchema = {
  [p: string]: any;
  populate: (info: PopulateAllSchema | PopulateSchema) => Promise<void>;
  save: () => Promise<void>;
  remove: () => Promise<void>;
  __key: {
    _id: {
      toString: () => string;
    };
  };
  select: (p: string) => Promise<void>;
};

export const GlobalMiddlewares: GlobalMiddlewareSchema = [];

export const Middlewares: MiddlewaresConfig = {};

export const Controllers: ControllersConfig = {};

type valueSchema = String | Number | Boolean | Date | Array<TypeSchema> | mongoose.Schema.Types.ObjectId
export type TypeSchema = typeof String | typeof Number | typeof Boolean | typeof Date | typeof Array | typeof mongoose.Schema.Types.ObjectId;
export type TypeRuleSchema = {
  type: TypeSchema//TypeSchema;
  required?: boolean;
  access?: 'private' | 'public' | 'secret' | 'admin' | 'default';
  ref?: string;
  populate?: boolean;
  match?: RegExp;
  default?: valueSchema;
  impact?: boolean;
  watch?: boolean;
  unique?: boolean;
  uniqueCaseInsitive?: boolean;
  lowerCase?: boolean;
  upperCase?: boolean;
  trim?: boolean;
  enum?: String[] | Number[] | Boolean[] | Date[] | Array<TypeSchema>[] | mongoose.ObjectId[];
  minlength?: number | [number, string];
  maxlength?: number | [number, string];
  min?: number;
  max?: number;
  get?: (value: valueSchema) => valueSchema;
  set?: (value: valueSchema) => valueSchema;
  file?: {
    size?: number | [number, number];
    length?: number | [number, number];
    type?: string[]
    dir?: string;
  }
  validate?: [{
    validator: (value: valueSchema) => boolean,
    msg: string
  }]
}

export type RuleSchema = TypeRuleSchema | TypeRuleSchema[]
export type DescriptionSchema = {
  [key: string]: RuleSchema;
} 