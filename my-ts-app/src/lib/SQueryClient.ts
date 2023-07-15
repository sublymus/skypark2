import { io } from "socket.io-client";

import { Config } from "./Config";
import { createModelFrom } from "./Model";
import { BaseInstance } from "./Instance";



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

const Descriptions:any = {}

export type FileType = {
  size: number,
  buffer: Buffer | ArrayBuffer,
  encoding: 'binary' | 'base64' | 'ascii' | 'hex' | 'base64url' | 'latin1' | 'ucs-2' | 'ucs2' | 'utf-8' | 'utf16le' | 'utf8'         //*NEW_ADD encoding
} & ({ name: string } | { fileName: string }) & ({ type: string } | { mime: string })

 
export const getDescription= async function (modelPath:string) {
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
    }, (res:any) => {
      // //console.log('server:description', res);
      if (res.error) throw new Error(JSON.stringify(res));
      Descriptions[modelPath] = res.response;
      Config.dataStore.setData('server:description:' + modelPath, Descriptions[modelPath])
      rev(Descriptions[modelPath]);
    })
  })
}
export function createSQueryFrom<D extends DescriptionsType>(Descriptions :D){
   function getInstanceType<T extends DescriptionSchema >() {

    const fun = (<k extends keyof TypeRuleSchema, o extends keyof TypeRuleSchema>() => {
  
        // type MapValue<T, key extends keyof T> = Map<string, Exclude<typeof t, MapConstructor>>
        type PropertyTypeOf<key extends keyof T, p extends keyof TypeRuleSchema> = T[key] extends TypeRuleSchema[] ? T[key][0][p] : T[key] extends TypeRuleSchema ? T[key][p] : any;
        type MapValue<key extends keyof T> = Map<string, PropertyTypeOf<key, o>>
        //type OF  = 'of' as keyof DataRuleSchema ;
  
        type Value<T, key extends keyof T> = T[key] extends { ref: infer U } ? (U extends keyof typeof Descriptions? Promise<ReturnType<typeof getInstanceType<(D)[U]>>>: never) : T[key] extends { type: typeof String } ? String : T[key] extends { type: typeof Number } ? Number : T[key] extends { type: typeof Boolean } ? Boolean : T[key] extends { type: typeof BigInt } ? BigInt : T[key] extends { type: typeof Map } ? MapValue<string & key> : PropertyTypeOf<string & key, k>;
        type ArrayValue<T, key extends keyof T> = T[key] extends Array<{ file: object }> ? (FileType | UrlData)[] : T[key] extends Array<{ ref: string }> ? Promise<BaseInstance>[] : T[key] extends Array<{ type: typeof String }> ? String[] : T[key] extends Array<{ type: typeof Number }> ? Number[] : T[key] extends Array<{ type: typeof Boolean }> ? Boolean[] : T[key] extends Array<{ type: typeof BigInt }> ? BigInt[] : T[key] extends Array<{ type: typeof Map }> ? MapValue<string & key>[] : PropertyTypeOf<string & key, k>[]
  
        type instance = {
            [key in keyof T as `${string & key}`]: (T[key] extends Array<object> ? (T[key] extends Array<{ required: true }> ? ArrayValue<T, key> : ArrayValue<T, key> | undefined) : (T[key] extends { required: true } ? Value<T, key> : Value<T, key> | undefined)) ///(T[key] extends {required :true } ?(Value<T , key>) : (Value<T , key>) |undefined )
        }
  
        const r = () => {
  
        }
        const obj = {} as (instance & BaseInstance);
        return obj;
    })
  
    return fun<'type', 'of'>();
  }
  
  
  
  const SQuery = {
    getInstanceType,
    model: async <T extends DescriptionSchema>(modelPath: keyof D & string) => {
      return await createModelFrom<typeof modelPath >(modelPath , Descriptions[modelPath],SQuery)  ;
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
    newInstance: async <T extends DescriptionSchema>(modelPath: keyof D &string, data: { id: string }) => {
      const model = await SQuery.model(modelPath);
      const instance = await model.newInstance(data);
     
      type InstanceType = ReturnType<typeof getInstanceType<T>>;
      return instance as InstanceType;
    },
  
  };
  
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
