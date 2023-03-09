
import mongoose from 'mongoose';
import { StatusSchema } from "../../App/Errors/STATUS";
import { ContextSchema } from "./Context";
import './execAuto';

export const AloFiles = {
  files: null,
};
export type FileSchema = {
  type: string;
  size: number;
  fileName: string;
  buffer: NodeJS.ArrayBufferView;
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
  modelInstance?: any,
  __parentModel?:string,
};
export type ControlSchema = (
  context: ContextSchema, 
  more?: MoreSchema
) => ResponseSchema;
export type ControllerSchema = {
  create?: ControlSchema;
  store?: ControlSchema;
  read?: ControlSchema;
  show?: ControlSchema;
  list?: ControlSchema;
  update?: ControlSchema;
  write?: ControlSchema;
  delete?: ControlSchema;
  destroy?: ControlSchema;
};
export type EventSting = "create" | "store" | "read" | "list" | "update" | "delete" | "destroy";

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
  option?: From_optionSchema & { modelPath: string };
  pre?: (event: EventSting, listener: ListenerPreSchema) => void;
  post?: (event: EventSting, listener: ListenerPostSchema) => void;
};

export type ControllersConfig = {
  [p: string]: CtrlMakerSchema;
};

export type From_optionSchema = {
  schema: {
    paths: {
      [p: string]: {
        instance: string;
        options?: {
          ref?: string;
        };
      };
    };
    obj: {
      [p: string]: any
    }
  };
  model: any;
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
  impact?: boolean; //default: false ; true =>  si un id est suprimer dans une list; son doc sera suprimer dans la BD 
  duplicable?:boolean;//default:false ; true =>  on peut ajouter plusieurs fois un meme id a une list de ref
  watch?: boolean;//default:false ; true =>  si un doc est suprimer, son id sera suprimer de tout les list qui l'on
  required?: boolean;
  access?: 'private' | 'public' | 'secret' | 'admin' | 'default';
  ref?: string;
  populate?: boolean;
  match?: RegExp;
  default?: valueSchema;
  unique?: boolean;
  uniqueCaseInsitive?: boolean;
  lowerCase?: boolean;
  upperCase?: boolean;
  trim?: boolean;
  enum?: String[] | Number[] | Boolean[] | Date[] | Array<TypeSchema>[] | mongoose.ObjectId[];
  minlength?: number | [number, string];
  maxlength?: number | [number, string];
  confirmList?: boolean;
  min?: number;
  max?: number;
  get?: (value: valueSchema) => valueSchema;
  set?: (value: valueSchema) => valueSchema;
  file?: {
    size?: number | [number, number];
    length?: number | [number, number];
    type?: string[]
    dir?: string;
  },
  validate?: [{
    validator: (value: valueSchema) => boolean,
    msg: string
  }]
}

export type RuleSchema = TypeRuleSchema | TypeRuleSchema[]
export type DescriptionSchema = {
  [key: string]: RuleSchema;
} 