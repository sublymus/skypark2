
import mongoose from 'mongoose';
import { StatusSchema } from "../../App/Errors/STATUS";
import { ContextSchema } from "./Context";
import './execAuto';

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
export type ResultSchema = (successCaseSchema | ErrorCaseSchema) & StatusSchema;
export type ResponseSchema = Promise<ResultSchema>;

export type MiddlewareSchema = (context: ContextSchema) => ResponseSchema | Promise<void | undefined>;

export type GlobalMiddlewareSchema = MiddlewareSchema[];

export type MoreSchema = {
  [p: string]: any;
  savedlist?: savedSchema[];
  modelPath?: string;
  modelInstance?: any,
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
export type ModelActionAllowed = "create" | "read" | "list" | "update" | "delete";
export type ModelActionAvailable = "create" | "store" | "read" | "list" | "update" | "delete" | "destroy";
export type ControllerAccesSchema = "public" | "share" | "admin" | "secret";
export type EventPreSchema = {
  ctx: ContextSchema; more?:
  MoreSchema;
  action?: string
};
export type EventPostSchema = {
  ctx: ContextSchema;
  more?: MoreSchema;
  res: ResultSchema;
  action: string;
};

export type ListenerPreSchema = (e: EventPreSchema) => Promise<void>;

export type ListenerPostSchema = (e: EventPostSchema) => Promise<void>;

export type ModelControllerConfigSchema = {
  option?: ModelFrom_optionSchema;
  pre: (action: ModelActionAvailable, listener: ListenerPreSchema) => void;
  post: (action: ModelActionAvailable, listener: ListenerPostSchema) => void;
}
export type ControllerConfigSchema = {
  option?: SaveCtrlOptionSchema;
  pre: (action: string, listener: ListenerPreSchema) => void;
  post: (action: string, listener: ListenerPostSchema) => void;
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
export type ModelFrom_optionSchema = {
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
  access?: ControllerAccesSchema;
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

export const GlobalMiddlewares: GlobalMiddlewareSchema = [];
export const ModelControllers: ModelControllersStorage = {};
export const Controllers: ControllersStorage = {};
type valueSchema = String | Number | Boolean | Date | Array<TypeSchema> | mongoose.Schema.Types.ObjectId;
export type TypeSchema = typeof String | typeof Number | typeof Boolean | typeof Date | typeof Array | typeof mongoose.Schema.Types.ObjectId;
export type TypeRuleSchema = {
  //valuePath // ./_id  ; ../../fileType;
   //checkout?:true,
  type: TypeSchema//TypeSchema;
  impact?: boolean; //default: false ; true =>  si un id est suprimer dans une list; son doc sera suprimer dans la BD 
  //watch?: boolean;//default:false ; true =>  si un doc est suprimer, son id sera suprimer de tout les list qui l'on
  alien?:boolean,
  strictAlien?:boolean,
  access?: 'private' | 'public' | 'secret' | 'admin' | 'default';//
  populate?: boolean;// 
  file?: {//
    size?: number | [number, number];
    length?: number | [number, number];
    type?: string[]
    dir?: string;
  },

  required?: boolean;
  ref?: string;
  refPath?: string;
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