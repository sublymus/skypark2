import { Socket, io } from "socket.io-client";

import { createModelFrom } from "./Model";
import EventEmiter, { EventInfo } from "./event/eventEmiter";
import { createInstanceFrom } from "./Instance";

/*

Affiche ses log Zoo

interface AuthState { 
    id: string,
    ...SQrery.Collector({
      profile: [ProfileInterface,''];
      address: [AddressInterface,''];
      manager: [ManagerInterface, '']
      messenger: [MessengerInterface,''];
      entreprise: [EntrepriseInterface,'']
      account: [Account, '']
    },{
      f1:{ ...qurey}
      f2:{ ...qurey}
      f3:{ ...qurey}
      f4:{ ...qurey}
    });
    
    openAuth: 'login' | 'none' | 'signup',
    setAccount: (data: AccountInterface) => void
    setOpenAuth: (openAuth:  'login' | 'none' | 'signup') => void
    setProfile: (data: ProfileInterface) => void
    setAddress: (data: AddressInterface) => void
    setMessenger: (data: MessengerInterface) => void
    setEntreprise: (data: EntrepriseInterface) => void
    fetchLoginManager:  (loginData: { email: string, password: string }) =>Promise<void>,
    fetchDisconnect: () =>Promise<void>,
}


////////////////////

initial data


*/

export type valueSchema = String | Number | Boolean | Date | Array<TypeSchema> | Buffer | Map<string, any> ;
export type TypeSchema = typeof String | typeof Number | typeof Boolean | typeof Date | typeof Array | typeof Buffer | typeof Map | { [k: string]: any };
export type RuleSchema = TypeRuleSchema | TypeRuleSchema[]

export type TypeRuleSchema = {
  type: TypeSchema,
  required?: boolean,
  strictAlien?: boolean,
  alien?: boolean,
  ref?: string,
  file?: object,
  of?: valueSchema,
}
export const DataRuleSchema: TypeRuleSchema = {
  type: String,
  required: true,
  ref: '',
  file: {},
  of: ''
}
export interface DescriptionSchema {
  [key: string]: RuleSchema;
}
export interface DescriptionsType {
  [key: string]: DescriptionSchema;
}

export interface  InstanceInterface{
  _id: string;
  __createdAt: number,
  __updatedAt: number,
}
export type ArrayData<I extends InstanceInterface> = {
  added: string[],
  removed: string[],
  items: I[],
  totalItems: number,
  limit: number,
  totalPages: number,
  page: number,
  pagingCounter: number,
  hasPrevPage: boolean,
  hasNextPage: boolean,
  prevPage: number | null,
  nextPage: number | null
} | null | undefined;
export const ArrayDataInit = {
  added: [],
  removed: [],
  items: [],
  totalItems: 0,
  limit: 20,
  totalPages: 0,
  page: 1,
  pagingCounter: 0,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null
} as ArrayData<any>;
type Service = {
  send: {
    [key: string]: any,
  } | string,
  receive: any
}
type OneController = {
  [service: string]: Service
}
export interface ControllerType {
  [ctrl: string]: OneController
}

const socket = null;

export type UrlData = {
  url: string,
  size: number,
  extension: string,
  _id:string,
}

const Descriptions: any = {}

export type FileType = {
  size: number,
  buffer: Buffer | ArrayBuffer | string,
  encoding: 'binary' | 'base64' | 'ascii' | 'hex' | 'base64url' | 'latin1' | 'ucs-2' | 'ucs2' | 'utf-8' | 'utf16le' | 'utf8'         //*NEW_ADD encoding
  fileName: string,
  type: string
}



// export const getDescription = async function (modelPath: string) {
//   if (typeof modelPath != 'string') throw new Error('getDescription(' + modelPath + ') is not permit, parameter must be string');
//   if (Descriptions[modelPath]) {
//     return Descriptions[modelPath]
//   } else if (Config.dataStore.useStore) {
//     const data = await Config.dataStore.getData('server:description:' + modelPath);
//     if (data) {
//       return Descriptions[modelPath] = data;
//     }
//   }
//   return await new Promise((rev) => {
//     // //console.//consolelog('********************');
//     socket?.emit('server:description', {
//       modelPath,
//     }, (res: any) => {
//       // //console.log('server:description', res);
//       if (res.error) throw new Error(JSON.stringify(res));
//       Descriptions[modelPath] = res.response;
//       Config.dataStore.setData('server:description:' + modelPath, Descriptions[modelPath])
//       rev(Descriptions[modelPath]);
//     })
//   })
// }
interface InitInterface {
  socket: Socket,
  setCookie: (cookies: string) => Promise<void>,
  getCookie: () => Promise<string>,
  setJSON?: (key: string, JSON: string) => Promise<void>,
  getJSON?: () => Promise<string>
}
export async function createSQueryFrom<D extends DescriptionsType, C extends { [key in keyof D]: C[key] }, Ctrl extends ControllerType>(Descriptions: D, CacheValues: C, Controller: Ctrl, init: InitInterface) {

  init.socket.on("storeCookie", async (cookie: string, cb) => {
    await init.setCookie(cookie);
    cb(init.getCookie());
  });
  //init

   console.log('available cookies', await init.getCookie());
   

  type ModelType<K extends keyof D> = D[K];
  type SortType<K extends keyof D> = {
    [key in keyof (D[K])]?: 1 | -1
  } & { [key: string]: any }
  type QueryType<K extends keyof D> = {
    //TODO*
    [key in keyof (D[K] | '$and' | '$or' | '$nor' | '$comment' | '$text' | '$where')]?: any;
  } & { [key: string]: any };

  type Pagging<K extends keyof D> = {
    page?: number,
    limit?: number,
    select?: string,
    sort?: SortType<K>,
    query?: QueryType<K>
  };

  type ArrayUpdateOption<K extends keyof D> = {
    addId: string[],
    addNew: { [key in keyof Partial<D[K]>]: CreateAbstractModel<K, key> }[],
    remove: string[],
    paging: Pagging<K>
  }
  type listenerSchema<T> = ((value: T, e?: EventInfo<T>) => void) & {
    uid?: string;
  };
  type ModifiedData = {
    added: string[],
    removed: string[],
  }
  type ArrayData<K extends keyof D> = {
    added: string[],
    removed: string[],
    items: K extends keyof D ? (typeof CacheValues[K])[] : K[],
    itemsInstance: ReturnType<typeof getInstanceType<ModelType<K>, K>>[],
    totalItems: number,
    limit: number,
    totalPages: number,
    page: number,
    pagingCounter: number,
    hasPrevPage: boolean,
    hasNextPage: boolean,
    prevPage: number,
    nextPage: number
  } | null | undefined
  type ArrayInstance<K extends keyof D> = {
    when: <e extends ('update' | 'refresh') >(event: e, listener: listenerSchema<e extends 'update' ? ModifiedData : ArrayData<K>>, uid?: string) => void,
    update: (options: Partial<ArrayUpdateOption<K>>) => Promise<ArrayData<K>|undefined>;
    last: () => Promise<ArrayData<K>|undefined>;
    next: () => Promise<ArrayData<K>|undefined>;
    back: () => Promise<ArrayData<K>|undefined>;
    page: (page?: number) => Promise<ArrayData<K>|undefined>;
  }

  type E<K extends keyof D> = keyof {
    [key in keyof C[K]as (`refresh:${key & string}` | `refresh`)]: any
  }
  type V<K extends keyof D> = Partial<C[K]>

  type BaseInstance<K extends keyof D> = {
    update(data: { [key in keyof Partial<D[K]>]: CreateAbstractModel<K, key> }): void
    when(event: E<K>, listener: ((v: V<K>, e: EventInfo<V<K>>) => void),uid?: string): void;
    extractor<K extends keyof D>(extractorPath: string): Promise<BaseInstance<K> | null>;
    $modelPath: K;
    $parentModelPath: string | undefined;
    $parentId: string | undefined;
    $parentProperty: string | undefined;
    $model: ModelSchema<K>;
    getEmiter(): EventEmiter,
    $id: string;
    _id: string;
    __createdAt: number,
    __updatedAt: number,
    $cache: C[K];
    newParentInstance<key extends keyof D>(): Promise<ReturnType<typeof getInstanceType<ModelType<key>, key>> | null>;
  }
  type Receive<T> = {
    response?: T,
    error?: string,
    message: string,
    status: number,
    code: string
  }
  //TYPE*
  type Send<T> = T extends `create_${infer U}` ? (U extends keyof D ? { [key in keyof Partial<D[U]>]: CreateAbstractModel<U, key> } : never) : T;


  type PropertyTypeOf<T extends DescriptionSchema, key extends keyof T, p extends keyof TypeRuleSchema> = T[key] extends TypeRuleSchema[] ? T[key][0][p] : T[key] extends TypeRuleSchema ? T[key][p] : any;

  type Value<I extends keyof TypeRuleSchema, T extends DescriptionSchema, key extends keyof T> = T[key] extends { ref: infer U } ? (U extends keyof D ? Promise<ReturnType<typeof getInstanceType<(D)[U], U>>> : never) : T[key] extends { type: typeof String } ? string : T[key] extends { type: typeof Number } ? number : T[key] extends { type: typeof Boolean } ? boolean  : T[key] extends { type: typeof Map } ? Map<string, PropertyTypeOf<T, key, 'of'>> : PropertyTypeOf<T, string & key, I>;
  type ArrayValue<T extends DescriptionSchema, key extends keyof T> = T[key] extends Array<{ file: object }> ? (FileType | UrlData)[] : T[key] extends Array<{ ref: infer U }> ? (U extends keyof D ? Promise<ArrayInstance<U>> : never) : T[key] extends Array<{ type: typeof String }> ? string[] : T[key] extends Array<{ type: typeof Number }> ? number[] : T[key] extends Array<{ type: typeof Boolean }> ? boolean[] : T[key] extends Array<{ type: typeof Map }> ? Map<string, PropertyTypeOf<T, key, 'of'>>[] : PropertyTypeOf<T, string & key, 'type'>[]

  function getInstanceType<T extends DescriptionSchema, K extends keyof D>() {

    
      // type MapValue<T, key extends keyof T> = Map<string, Exclude<typeof t, MapConstructor>>

      //type OF  = 'of' as keyof DataRuleSchema ;

      
      type instance = {
        [key in keyof T as `${string & key}`]?: T[key] extends Array<{}> ? ArrayValue<T, key> : Value<'type', T, key>
      }

      const obj = {} as (instance & BaseInstance<K>);
      return obj;
   
  }

  type CreateModel<I extends keyof TypeRuleSchema, K extends keyof D, key extends keyof D[K]> = D[K][key] extends { ref: infer U, strictAlien: true } ? (U extends keyof D ? string : never) : D[K][key] extends { ref: infer U, alien: true } ? (U extends keyof D ? string | { [t in keyof Partial<D[U]>]: CreateAbstractModel<U, t> } : never) : D[K][key] extends { ref: infer U } ? (U extends keyof D ? { [t in keyof Partial<D[U]>]: CreateAbstractModel<U, t> } : never) : D[K][key] extends Array<{ file: {} }> ? FileType[] : Value<I, D[K], key>;
  type CreateArryModel< K extends keyof D, key extends keyof D[K]> = D[K][key] extends Array<{ file: {} }> ? (FileType | UrlData)[] : D[K][key] extends Array<{ ref: infer U, strictAlien: true }> ? (U extends keyof D ? (string)[] : never) : D[K][key] extends Array<{ ref: infer U, alien: true }> ? (U extends keyof D ? (string | { [t in keyof Partial<D[U]>]: CreateAbstractModel<U, t> })[] : never) : D[K][key] extends Array<{ ref: infer U }> ? (U extends keyof D ? ({ [t in keyof Partial<D[U]>]: CreateAbstractModel<U, t> })[] : never) : ArrayValue< D[K], key>;

  type CreateAbstractModel<K extends keyof D, key extends keyof D[K]> = (D[K][key] extends Array<object> ? (CreateArryModel<K, key> | undefined) : (CreateModel<'type', K, key> | undefined));

  type ModelSchema<K extends keyof D> = {
    description: D[K];
    create: (data: { [key in keyof Partial<D[K]>]: CreateAbstractModel<K, key> }) => Promise<ReturnType<typeof getInstanceType<ModelType<K>, K>> | null>;
    newInstance: (value: { id: string } | { cache: Partial<C[K]> & { _id: string } }) => Promise<ReturnType<typeof getInstanceType<ModelType<K>, K>>>;
    update: (data: { [key in keyof Partial<D[K]>]: CreateAbstractModel<K, key> } & { id: string }) => Promise<ReturnType<typeof getInstanceType<ModelType<K>, K>> | null>;
    delete: (data: { id: string }) => Promise<void>;
  };

  type collectPaggingType<K extends keyof D> = {
    [key in keyof Pagging<K> as `$${key & string}`]: any;
  };
  type collectPagging<K extends keyof D> = {
    [key in keyof collectPaggingType<K>]: key extends `$${infer U}` ? U extends keyof Pagging<K> ? Pagging<K>[U] : never : never
  };
  type Values<key extends keyof D, k extends keyof D[key]> = (D[key][k] extends Array<{ ref: infer U }> ? (U extends keyof D ? true : never) : (D[key][k] extends { ref: infer U } ? (U extends keyof D ? true : never) : undefined));
  type ObjValues<K extends keyof D> = {
    [key in keyof D[K]]: Values<K, key & string>
  }
  type CollectKey<key extends keyof D> = {
    //[k in keyof D[key] ]?: k extends keyof D[key] ? (D[key][k] extends Array<{ ref: infer U }> ? (U extends keyof D ? CollectKey<U>&collectPagging<U>  : never) : (D[key][k] extends { ref: infer U } ? (U extends keyof D ? CollectKey<U> : never) : undefined)) : k;
    [k in DESELECT<ObjValues<key>, undefined>]?: k extends keyof D[key] ? (D[key][k] extends Array<{ ref: infer U }> ? (U extends keyof D ? CollectKey<U> & collectPagging<U> : never) : (D[key][k] extends { ref: infer U } ? (U extends keyof D ? CollectKey<U> : never) : undefined)) : k;
  }

  type test = {
    a: string,
    b: number,
    c: boolean,
    d: string | undefined,
    e: number | undefined,
    f: boolean | undefined,
    g: Function,
    h: undefined
  }


  type selectProperty<T, V> = {
    [k in keyof T]: T[k] extends (V) ? k : undefined;
  };
  type SELECT<T, V> = Exclude<selectProperty<T, V>[keyof selectProperty<T, V>], undefined>;

  type DESELECT<T, V> = Exclude<keyof T, Exclude<selectProperty<T, V>[keyof selectProperty<T, V>], undefined>>;

  type CollectType = {
    [key in keyof D]?: string[]
  } & {
    $option: {
      [key in keyof D]?: CollectKey<key>
    }
  };
  const SQuery = {
    socket:init.socket,

    async collector<Q extends CollectType>(collect: Q): Promise<{ [key in keyof Q]: key extends keyof D ? ReturnType<typeof getInstanceType<ModelType<key>, key>>[] : never; }> {
      const c = await new Promise<any>((rev) => {
        SQuery.emit('server:collector', collect,
          async (res: any) => {
            if (res.error) {
              console.log(`%c ERROR_SERVER %c server:collector`, 'font-weight: bold; font-size: 14px;color: orange; ', 'font-weight: bold; font-size: 20px;color: red; ');
              console.log(`%c ${JSON.stringify(res)}`, 'background: #3455; ');
              return rev([])
            }
            rev(res.response);
          }
        );
      });
      
      const Result: any = {}
      for (const key in c) {
        if (Object.prototype.hasOwnProperty.call(c, key)) {
          const cacheArray = c[key];
          Result[key] = [];
          const model = await SQuery.createModel(key);
          for (const cache of cacheArray) {
            console.log(cache);
            const instance = await model.newInstance({
              cache,
            });
            //console.log(instance);

            Result[key].push(instance);
          }
        }
      }
      return Result;
    },
    //TYPE*
    bind<Q extends {
      [key in keyof Q]: BaseInstance<any> | undefined | null
    }>(instancesData: Q, binder: (actu: (caches: Partial<C>) => ({
      [e in keyof Partial<D>]: C[e]
    })) => any) {
      const instanceBinder = (instance: BaseInstance<any>, instanceName: keyof Q & string, binder: (actu: (caches: any) => any) => any) => {

        const listener = (v: any) => {
          console.log(listener.uid, instanceName);

          binder((state) => ({
            [instanceName]: {
              ...state[instanceName],
              ...v
            }
          }))
        };
        listener.uid = instance.$id;
        instance?.when('refresh', listener);

      };
      for (const key in instancesData) {
        if (Object.prototype.hasOwnProperty.call(instancesData, key)) {
          const instance = instancesData[key];
          if (instance) instanceBinder(instance, key, binder)
        }
      }

    },
    unbind<Q extends {
      [key in keyof Q]: BaseInstance<any> | undefined | null
    }>(instancesData: Q) {
      const unbind = (instance: BaseInstance<any>) => {
        instance.getEmiter().remove({
          event: 'refresh',
          uid: instance.$id
        });
      };
      for (const key in instancesData) {
        if (Object.prototype.hasOwnProperty.call(instancesData, key)) {
          const instance = instancesData[key];
          if (instance) unbind(instance)
        }
      }
    },
    async createModel<K extends keyof D>(modelPath: K & string) {
      const model = await createModelFrom(modelPath, Descriptions[modelPath], SQuery);

      return model as ModelSchema<K>
    },
    async currentClientInstance<K extends keyof D>(): Promise<ReturnType<typeof getInstanceType<ModelType<K>, K>> | null> {

      return await new Promise((rev) => {
        SQuery.emit("server:currentClient", {}, async (res: any) => {
          if (res.error) {
            console.log(`%c ERROR_SERVER %c ${'server'}:${'currentClient'}`, 'font-weight: bold; font-size: 14px;color: orange; ', 'font-weight: bold; font-size: 20px;color: red; ');
            console.log(`%c ${JSON.stringify(res)}`, 'background: #3455; ');
            return rev(null);
          }; //throw new Error(JSON.stringify(res));
          const userModel: any = await SQuery.createModel(
            res.response.signup.modelPath
          );
          if (!userModel) rev(null); //throw new Error("Model is null for modelPath : " + res.modelPath);
          const userInstance = await userModel.newInstance({
            id: res.response.signup.id,
          });
          rev(userInstance);
        });
      });
    },
    emitNow(event: string, ...arg: any) {
      if (typeof event != "string")
        throw new Error(
          "cannot emit with following event : " +
          event +
          "; event value must be string"
        );
      if (init.socket.connected) {
        init.socket.emit(event, ...arg);
      } else {
        throw new Error("DISCONNECT FROM SERVER");
      }
    },
    emit(event: string, ...arg: any[]) {
      if (typeof event != "string")
        throw new Error(
          "cannot emit with following event : " +
          event +
          "; event value must be string"
        );
        init.socket.emit(event, ...arg);
    },
    on(event: string, listener: Function) {
      if (typeof event != "string")
        throw new Error(
          "cannot emit with following event : " +
          event +
          "; event value must be string"
        );
        init.socket.on(event, (...ert: any[]) => {
        listener(...ert);
      });
    },
    async service<Kc extends keyof Ctrl, Ks extends keyof Ctrl[Kc]>(ctrl: Kc & string, service: Ks & string, data: Send<Ctrl[Kc][Ks]['send']>): Promise<Receive<Ctrl[Kc][Ks]['receive']>> {
      return await new Promise((rev) => {
        SQuery.emit(
          ctrl + ":" + service,
          data,
          async (res: any) => {
            if (res.error) {
              console.log(`%c ERROR_SERVER %c ${ctrl}:${service}`, 'font-weight: bold; font-size: 14px;color: orange; ', 'font-weight: bold; font-size: 20px;color: red; ');
              console.log(`%c ${JSON.stringify(res)}`, 'background: #3455; ');
            }
            rev(res);
          }
        );
      });
    },
    async newInstance<K extends keyof D>(modelPath: K & string, data: { id: string } | { cache: Partial<BaseInstance<K>['$cache']> & { _id: string } }) {
      const model = await SQuery.createModel(modelPath);
      const instance = await model.newInstance(data);
      type InstanceType = ReturnType<typeof getInstanceType<D[K], K>>;
      return (instance as InstanceType | null);
    },
    cacheFrom<Q extends {
      [key in keyof Q]: BaseInstance<any> | undefined | null
    }>(instanceCollector: Q) {

      type Result = {
        [key in keyof Q]: Required<Q[key] > extends (BaseInstance<infer U> | undefined| null) ? U extends keyof D ? C[U] | undefined : undefined : undefined;
      }
      const caches: any = {};
      for (const key in instanceCollector) {
        if (Object.prototype.hasOwnProperty.call(instanceCollector, key)) {
          const instance = instanceCollector[key];
          if (instance) CacheValues[key]
          caches[key] = (instance as any as BaseInstance<typeof key>)?.$cache
        }
      }
      return caches as Result
    }

  };
  //type cacheFromParams = ;
  (async()=>{
    const cookie =  await init.getCookie();
    console.log('cookie',cookie);
    
    await SQuery.service('server','setCookie',{
      cookie,
    } as any);
  })()
   ;
  return SQuery;
}


export default createSQueryFrom;

// function getIP(callback){
//     fetch('https://api.ipregistry.co/?key=tryout')
//       .then(response => response.json())
//       .then(data => callback(data));
//   }
//   getIP(function(ip){
//   //console.log(ip);

//   });
