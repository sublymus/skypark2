import mongoose, { Schema } from 'mongoose';
import { ContextSchema } from "./Context";
import { Controller } from './SQuery_controller';
import { ModelController } from './SQuery_ModelController';

/****************************************************************** */
/********************         Controller Type     *******************/
/****************************************************************** */

export interface ControllerInterface< D extends servicesDescriptionInterface, N extends string, S extends ServiceListInterface> extends ControllerAddonInterface<D, N, S>, ControllerInfoInterface<D, N, S> {
}
export interface servicesDescriptionInterface {
  [key: string]: {
    data: any,
    result: any
  }
}
export interface ControllerAddonInterface<D extends servicesDescriptionInterface, N extends string, S extends ServiceListInterface> {
  //tools: ToolsInterface
  pre: (service: keyof S&string ,listener: ListenerPreSchema) => ControllerInterface<D,N, S>;
  post: (service: keyof S&string , listener: ListenerPostSchema) => ControllerInterface<D,N, S>;
}


export interface ControllerInfoInterface<D extends servicesDescriptionInterface, N extends string, S extends ServiceListInterface> {
  services: S,
  name: N,
  servicesDescription?: D,
};


export interface ServiceListInterface {
  [p: string]: ServiceInterface
}


export type ServiceInterface = (
  context: ContextSchema,
  more?: MoreSchema
) => ResponseSchema;


export interface  ControllerCollectionInterface{
  [p: string]: Controller;
}


/****************************************************************** */
/********************      ModelController Type     *****************/
/****************************************************************** */
//SQueryMongooseSchema
type PropertyTypeOf<T extends DescriptionSchema, key extends keyof T> = T[key] extends TypeRuleSchema[] ? T[key][0]['type'] : T[key] extends TypeRuleSchema ? T[key]['type'] : any;
type PropertyType<T extends DescriptionSchema, key extends keyof T> = T[key] extends TypeRuleSchema[] ? T[key][0]['type'] : T[key] extends TypeRuleSchema ? T[key]['of'] : any;

type Value<T extends DescriptionSchema, key extends keyof T> = T[key] extends { type:typeof Schema.Types.ObjectId} ? Schema.Types.ObjectId|string : T[key] extends { type: typeof String } ? string : T[key] extends { type: typeof Number } ? number : T[key] extends { type: typeof Boolean } ? boolean  : T[key] extends { type: typeof Map } ? Map<string, PropertyTypeOf<T, key>> : PropertyType<T, string & key>;
type ArrayValue<T extends DescriptionSchema, key extends keyof T> =  T[key] extends Array<{type:typeof Schema.Types.ObjectId}> ? (Schema.Types.ObjectId|string)[]  : T[key] extends Array<{ type: typeof String }> ? string[] : T[key] extends Array<{ type: typeof Number }> ? number[] : T[key] extends Array<{ type: typeof Boolean }> ? boolean[] : T[key] extends Array<{ type: typeof Map }> ? Map<string, PropertyTypeOf<T, key>>[] : PropertyType<T, string & key>[]
export type superD <T extends DescriptionSchema>= {
  [key in keyof T as `${string & key}`]?: T[key] extends Array<{}> ? ArrayValue<T, key> : Value< T, key>
};
export type SQueryMongooseSchema<D extends DescriptionSchema> = mongoose.Schema<superD<D>, mongoose.Model< superD<D>, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions> & { description: D }

//ModelControllerInterface
export interface ModelControllerInterface< D extends servicesDescriptionInterface, N extends string ,S extends ServiceListInterface, DES extends DescriptionSchema> extends ControllerInterface<D,N,S>{
  volatile:boolean,
  model:mongoose.Model<superD<DES>>,
  schema:D
}
export interface ModelOptionInterface<S, N extends string> { schema: S , name: N, volatile?: boolean }
export interface  ModelControllerCollectionInterface{
  [p: string]: ModelController<any,any,any>;
}
export type ModelControllerSchema = {
  create?: ServiceInterface;
  store?: ServiceInterface;
  read?: ServiceInterface;
  show?: ServiceInterface;
  list?: ServiceInterface;
  update?: ServiceInterface;
  write?: ServiceInterface;
  delete?: ServiceInterface;
  destroy?: ServiceInterface;
};


/****************************************************************** */
/********************      RESPONSE Type     *****************/
/****************************************************************** */


export type StatusSchema = {
  code: string,
  message: string,
  status: number,
}
export type InstanceDataPathsType = {
  url: string,
  size: number,
  extension: string,
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
export type ResponseSchema = Promise<ResultSchema |void| undefined>;


/****************************************************************** */
/********************      RESPONSE Type     *****************/
/****************************************************************** */

export type MiddlewareSchema = (context: ContextSchema) => ResponseSchema | Promise<void | undefined>;

export type GlobalMiddlewareSchema = MiddlewareSchema[];

export type savedSchema = {
  modelId: string;
  __key: string;
  controller: ModelController<any,any,any>;
};
export type MoreSchema = {
  [p: string]: any;
  savedlist?: savedSchema[];
  modelPath?: string;
  modelInstance?: any,
  lastInstance?: any,
  modelId?: string,
  __parentModel?: string,
  parentList?: {
    modelPath:string,
    id:string,
  }[],
};

/** Controller Model Interface */

export type ModelServiceAllowed = "create" | "read" | "list" | "update" | "delete";
//export type ModelServiceAvailable = "create" | "store" | "read" | "list" | "update" | "delete" | "destroy";
export type ModelAccessAvailable = 'private' | 'public' | 'secret' | 'admin' | 'default' | 'share' | undefined;
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


export type ListenerPreSchema = (e: EventPreSchema) => Promise<void | ResultSchema>;

export type ListenerPostSchema = (e: EventPostSchema) => Promise<void | ResultSchema>;



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
  __modelPath: string,
  id: string;
  __do_not_exist: boolean,
  __key: {
    _id: {
      toString: () => string;
    };
  };
  _id: {
    toString: () => string;
  };
  __parentModel: string,
  __permission?: string,
  __signupId?: string,
  __createdAt: number,
  __updatedAt: number,
  __updatedProperty: string[],

  select: (p: string) => Promise<void>;
};
export interface ModelToolsInterface {

}

export const Tools: ToolsInterface = {} as ToolsInterface
export const GlobalMiddlewares: GlobalMiddlewareSchema = [];
export type valueSchema = String | Number | Boolean | Date | Array<TypeSchema> | mongoose.Schema.Types.ObjectId | Schema.Types.Mixed | Buffer | Map<String, Object> | Schema.Types.Map | Schema.Types.Decimal128 | Schema | Schema.Types.UUID | Object;
export type TypeSchema = typeof String | typeof Number | typeof Boolean | typeof Date | typeof Array | typeof mongoose.Schema.Types.ObjectId | typeof Schema.Types.Mixed | typeof Buffer | typeof Map | typeof Schema.Types.Decimal128| typeof Schema | typeof Schema.Types.UUID | { [p: string]: TypeSchema | TypeSchema[] };

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
  emit?: boolean// si la property doit invalider
  alien?: boolean,
  strictAlien?: boolean,
  access?: ModelAccessAvailable;//
  file?: {//
    size?: number | [number, number];
    length?: number | [number, number];
    type?: string[]
    dir?: string[];
  },
  ref?: string;
  _default?: valueSchema;
  share?: {
    target?: {
      maxMember: number,
      addSelf: boolean,
      allow: ('a'| 'l'| 'w'| 'r'| 'fd')[],
    }
    only?: string[],
    exc?: string[],
  }|string,
  //rule?:any,
  //bind?:any,
  deep?: Number,

  default?: valueSchema;
  populate?: boolean;// 
  expires?: number,
  index?: boolean,
  sparse?: boolean,
  select?: boolean,
  transform?: Function | Promise<any>
  immutable?: boolean, //  si <isNew: true> sera definie
  alias?: string,
  of?: string,
  refPath?: string;
  required?: boolean;
  match?: RegExp;
  unique?: boolean;
  uniqueCaseInsitive?: boolean;
  lowerCase?: boolean;
  upperCase?: boolean;
  trim?: boolean;
  enum?: valueSchema[] | { values: valueSchema[], message: string },
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



type selectProperty<T, V> = {
  [k in keyof T]: T[k] extends (V) ? k : undefined;
};
export type SELECT<T, V> = Exclude<selectProperty<T, V>[keyof selectProperty<T, V>], undefined>;

export type DESELECT<T, V> = Exclude<keyof T, Exclude<selectProperty<T, V>[keyof selectProperty<T, V>], undefined>>;
