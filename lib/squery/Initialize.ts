import './execAuto'
import mongoose, { Schema } from 'mongoose';
import { ContextSchema } from "./Context";
import EventEmiter from './event/eventEmiter';
export type StatusSchema = {
  code: string,
  __key ?: string,
  message: string,
  status: number,
}
export type FileSchema = {
  type: string;
  size: number;
  fileName: string;
  buffer: any;
  encoding: 'binary' | 'base64' | 'ascii' | 'hex' | 'base64url' | 'latin1' | 'ucs-2' | 'ucs2' | 'utf-8' | 'utf16le' | 'utf8'
};
export type ErrorCaseSchema = {
  response?: any;
  error: any;
};

export type successCaseSchema = {
  response: any;
  error?: any;
};
export type ResultSchema = (successCaseSchema | ErrorCaseSchema) & StatusSchema;
export type ResponseSchema = Promise<ResultSchema>;

export type MiddlewareSchema = (context: ContextSchema) => ResponseSchema | Promise<void | undefined>;

export type GlobalMiddlewareSchema = MiddlewareSchema[];

export type MoreSchema = {
  [p: string]: any;
  savedlist?: savedSchema[];
  modelPath?: string;
  modelInstance?: any,
  lastInstance?: any,
  modelId?: string,
  signupId?: string,
  __parentModel?: string,
};
export type ControlSchema = (
  context: ContextSchema,
  more?: MoreSchema
) => ResponseSchema;

export type ControllerSchema = {
  [p: string]: ControlSchema
}
export type ModelControllerSchema = {
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
export type ModelServiceAllowed = "create" | "read" | "list" | "update" | "delete";
export type ModelServiceAvailable = "create" | "store" | "read" | "list" | "update" | "delete" | "destroy";
export type ModelAccessAvailable = 'private' | 'public' | 'secret' | 'admin' | 'default'| 'share' | undefined;
export type ControllerAccesSchema = "public" | "share" | "admin" | "secret";
export type EventPreSchema = {
  ctx: ContextSchema;
  more?: MoreSchema;
};
export type EventPostSchema = {
  ctx: ContextSchema;
  more?: MoreSchema;
  res: ResultSchema;
};
export type UrlDataType = {
  realPath: string,
  property: string,
  id: string,
  modelPath: string,
  createdAt: number,
}


export type ListenerPreSchema = (e: EventPreSchema) => Promise<void>;

export type ListenerPostSchema = (e: EventPostSchema) => Promise<void>;

export type ModelControllerConfigSchema = {
  option?: ModelFrom_optionSchema;
  pre: (service: ModelServiceAvailable, listener: ListenerPreSchema) => CtrlModelMakerSchema;
  post: (service: ModelServiceAvailable, listener: ListenerPostSchema) => CtrlModelMakerSchema;
  tools:ToolsInterface & {maker:CtrlModelMakerSchema},
}
export type ControllerConfigSchema = {
  option?: SaveCtrlOptionSchema;
  tools:ToolsInterface & { maker: CtrlMakerSchema }
  pre: (service: string, listener: ListenerPreSchema) => CtrlMakerSchema;
  post: (service: string, listener: ListenerPostSchema) => CtrlMakerSchema;
}
export type CtrlModelMakerSchema = (() => ModelControllerSchema) & ModelControllerConfigSchema;
export type CtrlMakerSchema = (() => ControllerSchema) & ControllerConfigSchema
export type SaveCtrlOptionSchema = {
  ctrl: {
    [p: string]: ControllerSchema
  },
  name?: string,
  access?: {
    [p: string]: 'any' | 'user' | 'admin'
  },
};
export type ModelControllersStorage = {
  [p: string]: CtrlModelMakerSchema;
};
export type ControllersStorage = {
  [p: string]: CtrlMakerSchema;
};
export type bindData = {
  pattern: string,
  map?: {
    toLeft(v: any): any,
    toRight(v: any): any
  },
  rootParts?: string[];
  rootIdParts?: {
    [p: string]: {
      parts: string[]
    }
  },
  mode?: "bidirectional" | "unidirectional",
  emiter?: EventEmiter
}
export type ModelFrom_optionSchema = {
  schema: SQueryMongooseSchema;
  model:  mongoose.Model<any, unknown, unknown, unknown, any> & {paginate?:(...arg:any[])=>any};
  volatile: boolean;
  access?: ControllerAccesSchema;
  bind?: bindData[],
  query?: {
    [q: string]: {
      [p: string]: any
    }
  }
};

export type savedSchema = {
  modelId: string;
  __key: string;
  volatile: boolean;
  controller: ModelControllerSchema;
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
export interface ModelToolsInterface{

}
export interface ToolsInterface{
  [key:string]:(this:{maker:CtrlModelMakerSchema},data: unknown) => void
}
export const Tools : ToolsInterface = {} as ToolsInterface
export const GlobalMiddlewares: GlobalMiddlewareSchema = [];
export const ModelControllers: ModelControllersStorage = {};
export const Controllers: ControllersStorage = {};
export type SQueryMongooseSchema = Schema & { description: DescriptionSchema, model: any }
export type valueSchema = String | Number | Boolean | Date | Array<TypeSchema> | mongoose.Schema.Types.ObjectId| Schema.Types.Mixed |Buffer | Map<String,Object> |Schema.Types.Map | BigInt | Schema.Types.Decimal128 | Schema | Schema.Types.UUID;
export type TypeSchema = typeof String | typeof Number | typeof Boolean | typeof Date | typeof Array | typeof mongoose.Schema.Types.ObjectId | typeof  Schema.Types.Mixed | typeof Buffer | typeof Map | typeof Schema.Types.Map | typeof BigInt | typeof Schema.Types.Decimal128 | typeof Schema |  typeof Schema.Types.UUID | DescriptionSchema | { [p:string]: TypeSchema | TypeSchema[]};
type Share_ONY = {
  ony:string[],
};
type Share_ADD = {
  add:string[],
};
type Share_EXC = {
  exc:string[],
}
export type TypeRuleSchema = {
  //TODO: bind bindbidirectional // ./_id  ; ../../fileType; 
  //
  // TODO: {
  // get:(v)=> value
  //}
  //difine?:[string , TypeRuleSchema],
 
  type: TypeSchema//TypeSchema;
  impact?: boolean; //default: false ; true =>  si un id est suprimer dans une list; son doc sera suprimer dans la BD 
  //TODO: watch?: boolean;//default:false ; true =>  si un doc est suprimer, son id sera suprimer de tout les list qui l'on
  emit?:boolean// si la property doit invalider
  alien?: boolean,
  strictAlien?: boolean,
  access?: ModelAccessAvailable;//
  populate?: boolean;// 
  file?: {//
    size?: number | [number, number];
    length?: number | [number, number];
    type?: string[]
    dir?: string;
  },
  ref?: string;
  default?: valueSchema;
  share?:Share_ADD|Share_EXC|Share_ONY,
  //bind?:any,

  expires?:number,
  index?:boolean,
  sparse?:boolean,
  select?:boolean,
  transform?: Function | Promise<any>
  immutable?:boolean, //  si <isNew: true> sera definie
  alias?:string,
  of?:string,
  refPath?: string;
  required?: boolean;
  match?: RegExp;
  unique?: boolean;
  uniqueCaseInsitive?: boolean;
  lowerCase?: boolean;
  upperCase?: boolean;
  trim?: boolean;
  enum?: valueSchema[] | {values: valueSchema[] , message: string},
  minlength?: number | [number, string];
  maxlength?: number | [number, string];
  min?: number;
  max?: number;
  get?: (value: valueSchema) => valueSchema;
  set?: (value: valueSchema) => valueSchema;
  validate?: [{
    validator: (value: valueSchema) => boolean,
    msg: string
  }]
}

export type RuleSchema = TypeRuleSchema | TypeRuleSchema[]
export type DescriptionSchema = {
  [key: string]: RuleSchema;
} 