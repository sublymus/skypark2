import { io } from "socket.io-client";

import { Config } from "./Config";
import { createModelFrom } from "./Model";
import { BaseInstance } from "./Instance";
import { listenerSchema } from "./event/eventEmiter";

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

export type valueSchema = String | Number | Boolean | Date | Array<TypeSchema> | Buffer | Map<String, Object> | Map<string, any> | BigInt;
export type TypeSchema = typeof String | typeof Number | typeof Boolean | typeof Date | typeof Array | typeof Buffer | typeof Map | typeof BigInt | { [p: string]: TypeSchema | TypeSchema[] };
export type RuleSchema = TypeRuleSchema | TypeRuleSchema[]

export type TypeRuleSchema = {
  type: TypeSchema,
  required?: boolean,
  ref?: string,
  file?: object,
  of?: valueSchema
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
export const socket = io('http://localhost:3500', {
  extraHeaders: {},
});


socket.on("storeCookie", (cookie, cb) => {
  document.cookie = cookie;
  console.log("document.cookie :  ", document.cookie);
  cb(document.cookie);
});

console.log("available cookies:  ", document.cookie);

export const Global: any = {
  Type: {
    login: {
      modelPath: '',
      id: '',
    },
    signup: {
      modelPath: '',
      id: '',
    },
  }
};

export type UrlData = {
  url: string,
  size: number,
  extension: string,
}

const Descriptions: any = {}

export type FileType = {
  size: number,
  buffer: Buffer | ArrayBuffer,
  encoding: 'binary' | 'base64' | 'ascii' | 'hex' | 'base64url' | 'latin1' | 'ucs-2' | 'ucs2' | 'utf-8' | 'utf16le' | 'utf8'         //*NEW_ADD encoding
} & ({ name: string } | { fileName: string }) & ({ type: string } | { mime: string })


export const getDescription = async function (modelPath: string) {
  if (typeof modelPath != 'string') throw new Error('getDescription(' + modelPath + ') is not permit, parameter must be string');
  if (Descriptions[modelPath]) {
    return Descriptions[modelPath]
  } else if (Config.dataStore.useStore) {
    const data = await Config.dataStore.getData('server:description:' + modelPath);
    if (data) {
      return Descriptions[modelPath] = data;
    }
  }
  return await new Promise((rev) => {
    // //console.//consolelog('********************');
    socket.emit('server:description', {
      modelPath,
    }, (res: any) => {
      // //console.log('server:description', res);
      if (res.error) throw new Error(JSON.stringify(res));
      Descriptions[modelPath] = res.response;
      Config.dataStore.setData('server:description:' + modelPath, Descriptions[modelPath])
      rev(Descriptions[modelPath]);
    })
  })
}
export function createSQueryFrom<D extends DescriptionsType, C extends { [key in keyof D]: C[key] }>(Descriptions: D, CacheValues: C) {
  type ModelType<K extends keyof D> = D[K];
  type SortType<K extends keyof D> = {
    [key in keyof D[K]]?: 1 | -1
  } & { [key: string]: any }
  type QueryType<K extends keyof D> = {
    [key in keyof  D[K]]?: any
  } & { [key: string]: any };
  type ArrayUpdateOption<K extends keyof D> = {
    addId: string[],
    addNew: {[key in keyof Partial<D[K]>]: CreateAbstractModel<K, key>}[],
    remove: string[],
    paging: {
      page: number,
      limit: number,
      select: string,
      sort: SortType<K>,
      query: QueryType<K>
    }
  }
  type ArrayData<K extends keyof D> = {
    added: string[],
    removed: string[],
    items: (typeof CacheValues[K])[],
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
    when: (event: string, listener: listenerSchema, changeRequired?: boolean | undefined) => void,
    update: (options: Partial<ArrayUpdateOption<K>>) => Promise<ArrayData<K>>;
    last: () => Promise<ArrayData<K>>;
    next: () => Promise<ArrayData<K>>;
    back: () => Promise<ArrayData<K>>;
    page: (page?: number) => Promise<ArrayData<K>>;
  }

  type PropertyTypeOf<T extends DescriptionSchema , key extends keyof T, p extends keyof TypeRuleSchema> = T[key] extends TypeRuleSchema[] ? T[key][0][p] : T[key] extends TypeRuleSchema ? T[key][p] : any;
 
  type MapValue<o extends keyof TypeRuleSchema ,T extends DescriptionSchema,key extends keyof T> = Map<string, PropertyTypeOf<T,key, o>>
  type Value<I extends keyof TypeRuleSchema ,T extends DescriptionSchema, key extends keyof T> = T[key] extends { ref: infer U } ? (U extends keyof D ? Promise<ReturnType<typeof getInstanceType<(D)[U], U>>> : never) : T[key] extends { type: typeof String } ? String : T[key] extends { type: typeof Number } ? Number : T[key] extends { type: typeof Boolean } ? Boolean : T[key] extends { type: typeof BigInt } ? BigInt : T[key] extends { type: typeof Map } ? MapValue<'of',T,string & key> : PropertyTypeOf<T,string & key, I>;
  
  function getInstanceType<T extends DescriptionSchema, K extends keyof D>() {

    const fun = (<k extends keyof TypeRuleSchema, o extends keyof TypeRuleSchema>() => {



      // type MapValue<T, key extends keyof T> = Map<string, Exclude<typeof t, MapConstructor>>
      
     //type OF  = 'of' as keyof DataRuleSchema ;

      type ArrayValue<T extends DescriptionSchema, key extends keyof T> = T[key] extends Array<{ file: object }> ? (FileType | UrlData)[] : T[key] extends Array<{ ref: infer U }> ? (U extends keyof D ? Promise<ArrayInstance<U>> : never) : T[key] extends Array<{ type: typeof String }> ? String[] : T[key] extends Array<{ type: typeof Number }> ? Number[] : T[key] extends Array<{ type: typeof Boolean }> ? Boolean[] : T[key] extends Array<{ type: typeof BigInt }> ? BigInt[] : T[key] extends Array<{ type: typeof Map }> ? MapValue<'of',T,string & key>[] : PropertyTypeOf<T,string & key, k>[]

      type instance = {
        [key in keyof T as `${string & key}`]: (T[key] extends Array<object> ? (T[key] extends Array<{ required: true }> ? ArrayValue<T, key> : ArrayValue<T, key> | undefined) : (T[key] extends { required: true } ? Value<'type',T, key> : Value<'type',T, key> | undefined)) ///(T[key] extends {required :true } ?(Value<T , key>) : (Value<T , key>) |undefined )
      }

      const obj = {} as (instance & BaseInstance<C[K]>);
      return obj;
    })

    return fun<'type', 'of'>();
  }
  
  type CreateModel<I extends keyof TypeRuleSchema , K extends keyof D , key extends keyof D[K]> =  D[K][key] extends {ref: infer U} ?(U extends keyof D ? string|{[t in  keyof Partial<D[U]>]: CreateAbstractModel<U,t>} :never): D[K][key]  extends Array<{file: {}} >? FileType[]: Value<I,D[K],key>;
  type CreateArryModel<I extends keyof TypeRuleSchema , K extends keyof D , key extends keyof D[K]> =  D[K][key]  extends Array<{file: {}}>? FileType[]: D[K][key]  extends Array<{ref: infer U} >? (U extends keyof D? (string | {[t in keyof Partial< D[U]>]: CreateAbstractModel<U , t>})[]: never): Value<I,D[K],'type'>[];
  
  type CreateAbstractModel<K extends keyof D ,  key extends keyof D[K]> =  (D[K][key] extends Array<object> ? (D[K][key] extends Array<{ required: true }> ? CreateArryModel<'type',K, key> : CreateArryModel<'type',K, key> | undefined) : (D[K][key] extends { required: true } ? CreateModel<'type',K , key>  : CreateModel<'type',K , key>  | undefined));
  
  type ModelSchema<K extends keyof D> = {
    description: D[K];
    create: (value:{[key in keyof Partial<D[K]>]: CreateAbstractModel<K, key>}) => Promise<ReturnType<typeof getInstanceType<ModelType<K>, K>>>;
    newInstance: (value: {id:string}) => Promise<ReturnType<typeof getInstanceType<ModelType<K>, K>>>;
    newParentInstance: <key extends keyof D>(data: {
      childInstance: BaseInstance<typeof CacheValues[K]>;
    }) => Promise<ReturnType<typeof getInstanceType<ModelType<key>, key>>>;
    update: (value: { id: string; [str: string]: any }) => Promise<any>;
  };

  const SQuery = {
    getInstanceType,
    model: async <K extends keyof D>(modelPath: K&string) => {
      const model = await createModelFrom(modelPath, Descriptions[modelPath], SQuery);

      return model as ModelSchema<K>
    },
    socket,
    isInstance: async (instance: any) => {
      return (
        instance.$modelPath &&
        instance.$id &&
        instance.newParentInstance &&
        instance.update &&
        instance.when
      );
    },
    isArrayInstance: async (arrayInstance: any) => {
      return (
        arrayInstance.back &&
        arrayInstance.next &&
        arrayInstance.page &&
        arrayInstance.$itemModelPath &&
        arrayInstance.last &&
        arrayInstance.update &&
        arrayInstance.when
      );
    },
    isFileInstance: async (fileInstance: any) => {
      return false;
    },
    currentUserInstance: async () => {
      if (Global.userInstance) return Global.userInstance;
      return await new Promise((rev) => {
        SQuery.emit("server:currentUser", {}, async (res: any) => {
          if (res.error) rev(null); //throw new Error(JSON.stringify(res));
          const userModel: any = await SQuery.model(
            res.response.signup.modelPath
          );
          if (!userModel) rev(null); //throw new Error("Model is null for modelPath : " + res.modelPath);
          const userInstance = await userModel.newInstance({
            id: res.response.signup.id,
          });
          Global.userInstance = userInstance;
          rev(userInstance);
        });
      });
    },
    emitNow: (event: string, ...arg: any) => {
      if (typeof event != "string")
        throw new Error(
          "cannot emit with following event : " +
          event +
          "; event value must be string"
        );
      if (SQuery.socket.connected) {
        socket.emit(event, ...arg);
      } else {
        throw new Error("DISCONNECT FROM SERVER");
      }
    },
    emit: (event: string, ...arg: any) => {
      if (typeof event != "string")
        throw new Error(
          "cannot emit with following event : " +
          event +
          "; event value must be string"
        );
      socket.emit(event, ...arg);
    },
    on: (event: string, listener: Function) => {
      if (typeof event != "string")
        throw new Error(
          "cannot emit with following event : " +
          event +
          "; event value must be string"
        );
      socket.on(event, (...ert: any[]) => {
        listener(...ert);
      });
    },


    set dataStore(value) {
      Config.dataStore = {
        ...Config.dataStore,
        ...value,
      };
    },
    get dataStore() {
      return Config.dataStore;
    },

    service: async <T>(ctrl: string, service: string, data: any): Promise<any | null> => {
      return await new Promise((rev) => {
        SQuery.emit(
          ctrl + ":" + service,
          data,
          async (res: any) => {
            if (res.error) {
              rev(null);
            }
            rev(res);
          }
        );
      });
    },
    newInstance: async<K extends keyof D>(modelPath: K, data: { id: string }) => {
      const model = await SQuery.model(modelPath as keyof D & string);
      const instance = await model.newInstance(data);
      type InstanceType = ReturnType<typeof getInstanceType<D[K], K>>;
      return (instance as InstanceType| null);
    },
    cacheFrom: <Q extends {
      [key in keyof Q]:  key extends keyof D ? BaseInstance<C[key]>|undefined|null: never
    }>(instanceCollector: Q ) => {
      
      type Result = {
        [key in keyof Q]:  key extends keyof D ?  C[key]:undefined;
      }
      const caches :any ={};
      for (const key in instanceCollector) {
        if (Object.prototype.hasOwnProperty.call(instanceCollector, key)) {
          const instance = instanceCollector[key];
          if(instance) CacheValues[key]
          caches[key.replace('_','')] = (instance as BaseInstance<typeof CacheValues[typeof key]>).$cache
        }
      }
      return caches as Result
    }

  };
  //type cacheFromParams = ;
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
