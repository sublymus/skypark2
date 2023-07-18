import { Descriptions } from './../Descriptions';
import { SQuery } from '../AppStore';

import { createArrayInstanceFrom } from "./ArrayInstance";
import { Config } from "./Config";
import { DescriptionSchema, DescriptionsType, TypeRuleSchema, getDescription, socket } from "./SQueryClient";
import { Validator } from "./Validation";
import EventEmiter, { EventInfo, listenerSchema } from "./event/eventEmiter";

interface Model {

}


export interface BaseInstance<T> {
  update: (data: any) => void
  when: (event: keyof {
    [key in keyof T as (`refresh:${key &string}`| `refresh`)]: any
  }, listener: ((v:Partial<T>, e : EventInfo<Partial<T>> )=>void), changeRequired?: boolean) => this;
  extractor: (extractorPath: string) => Promise<BaseInstance<T> | null>;
  $modelPath: string;
  $parentModelPath: string | undefined;
  $parentId: string | undefined;
  $parentProperty: string | undefined;
  $model: Model;
  $id: string;
  $cache: T;
  newParentInstance: () => Promise<BaseInstance<T> | null>;
}

const InstanceCache: any = {};

export async function createInstanceFrom({ modelPath, id, Model , SQuery}: any) {

  const description = await getDescription(modelPath)
  if (!id || !modelPath) {
    console.log(`you are trying to read a undefined property, modelPath :${modelPath} , id:${id}`);
    return null;
  }
  let cache: any;
  let lastInstanceUpdateAt = 0;
  const refresh = async () => {
    await new Promise((rev) => {
      socket.emit(
        modelPath + ":read",
        {
          id: id,
        },
        async (res: any) => {
          if (res.error) return console.log(`ERROR_SERVER_RESULT`,JSON.stringify(res));
          cache = res.response;
          Config.dataStore.setData(modelPath + ":" + id, cache);
          lastInstanceUpdateAt = cache.__updatedAt;
          rev(cache);
        }
      );
    });
  };

  if (InstanceCache[modelPath + ":" + id]) {
    return InstanceCache[modelPath + ":" + id];
  } else if (Config.dataStore.useStore) {
    const data = await Config.dataStore.getData(modelPath + ":" + id);
    if (data) {
      console.log("data : ", data);
      cache = data;
      if (Config.dataStore.updateTimeOut) {
        setTimeout(async () => {
          await refresh();
          await emitRefresh();
        }, Config.dataStore.updateTimeOut + (100 + Config.dataStore.updateTimeOut * Math.random()));
      }
    }
  }

 
  const instance: any = {};
  const emiter = new EventEmiter();

  if (!cache) {
    cache = {};
    await refresh();
  }

  socket.on("update:" + cache._id, async (data: any) => {
    console.log("update:" + cache._id, data);
    cache = data.doc;
    Config.dataStore.setData(modelPath + ":" + id, cache);
    lastInstanceUpdateAt = data.doc.__updatedAt;
    await emitRefresh(data.properties);
  });
  //////
  async function emitRefresh(properties?: any) {
    let Objproperties: any = {};

    for (let index = 0; index < properties.length; index++) {
      const property = properties[index];
      Objproperties[property] = cache[property];
    }
    // properties.forEach(async (property: any) => {
    // });
    emiter.emit("refresh", Objproperties);
    console.log("refresh", Objproperties);
    
    if (properties) {
      properties.forEach(async (p: any) => {
        emiter.emit("refresh:" + p, {
          value: cache[p],
          get instance() {
            return new Promise(async (rev) => {
              rev(await instance[p]);
            });
          },
        });
      });
    } else {
      for (const p in description) {
        if (Object.hasOwnProperty.call(description, p)) {
          emiter.emit("refresh:" + p, {
            value: cache[p],
            get instance() {
              return new Promise(async (rev) => {
                rev(await instance[p]);
              });
            },
          });
        }
      }
    }
  }
  for (const property in description) {
    if (Object.hasOwnProperty.call(description, property)) {
      const rule = description[property];
      let lastPropertyUpdateAt = 0;
      let firstRead = true;
      let propertyCache: any = {}; 
      Object.defineProperties(instance, {
        [property]: {
          get: async function () {
            if (rule.ref) {
              console.log(propertyCache[property]);
              
              if (firstRead || lastPropertyUpdateAt != lastInstanceUpdateAt) {
                propertyCache[property] = await createInstanceFrom({
                  modelPath: rule.ref,
                  id: cache[property],
                  Model,
                });
                lastPropertyUpdateAt = lastInstanceUpdateAt;
                firstRead = false;
              }
              return propertyCache[property];
            } else if (rule[0] && rule[0].ref) {
              // invalible
              if (firstRead) {
                propertyCache[property] = await createArrayInstanceFrom({
                  modelPath,
                  id,
                  property,
                  description,
                  Model,
                });
                //*NEW_ADD
                // instance.when('refresh:' + property, () => {
                //     propertyCache[property].__$emulator();
                // })
                firstRead = false;
              }
              return propertyCache[property];
            } else if (rule[0]) {
              if (firstRead || lastPropertyUpdateAt != lastInstanceUpdateAt) {
                propertyCache[property] = cache[property];
                lastPropertyUpdateAt = lastInstanceUpdateAt;
                firstRead = false;
              }
              return propertyCache[property];
            } else {
              if (firstRead || lastPropertyUpdateAt != lastInstanceUpdateAt) {
                propertyCache[property] = cache[property];
                lastPropertyUpdateAt = lastInstanceUpdateAt;
                firstRead = false;
              }
              return propertyCache[property];
            }
          },
          set: async function (value) {
            //console.log('modelPath:', modelPath, 'value:', value);
            if (value == cache[property]) return;
            if (rule.ref) {
              //il faut just passer la value <id> au server
            } else if (rule[0] && rule[0].ref) {
              const ai = await instance[property];
              return await ai.update(value);
            } else if (rule[0] && rule[0].file) {
              const files = [];
              for (const p in value) {
                if (Object.hasOwnProperty.call(value, p)) {
                  const file = value[p];
                  const fileData = {
                    fileName: file.name || file.fileName,
                    size: file.size,
                    type: file.type || file.mime,
                    buffer: await file.arrayBuffer(),
                    //*NEW_ADD encoding
                  };
                  files.push(fileData);
                }
              }
              //console.log(files);
              value = files;
            }
            const result = await Validator(description[property], value);
            if (result.value == undefined) {
              // console.log('result.value == undefined');
              await emitRefresh([property]);
              throw new Error(
                "Invalide Value :" + value + " \n because : " + result.message
              );
            }
            try {
              await instance.update({
                id,
                [property]: value,
              });
            } catch (error) {
              console.error(error);
            }
          },
        },
      });
    }
  }
  instance.update = async (data: any) => {
    socket.emit(
      modelPath + ":update",
      {
        ...data,
        id,
      },
      (res: any) => {
        if (res.error) {
          throw new Error(JSON.stringify(res));
        }
        cache = res.response;
        Config.dataStore.setData(modelPath + ":" + id, cache);
        lastInstanceUpdateAt = cache.__updatedAt;
      }
    );
  };
  instance.when = (event: string, listener: any, changeRequired?: boolean) => {
    emiter.when(event, listener, changeRequired);
  };
  instance.extractor = async (extractorPath: string) => {
    if (extractorPath == "./") return instance;
    if (extractorPath == "../") return await instance.newParentInstance();
    return await new Promise((rev) => { 
      socket.emit(
        "server:extractor",
        {
          modelPath,
          id,
          extractorPath,
        },
        async (res: {
          error: any;
          response: { modelPath: string; id: any; property: string | number };
        }) => {
          if (res.error) throw new Error(JSON.stringify(res));
          const extractedModel = await SQuery.model(res.response.modelPath);
          if (!extractedModel)
            throw new Error(
              "extractedModel is null for modelPath : " + res.response.modelPath
            );
          const extractedInstance = await extractedModel.newInstance({
            id: res.response.id,
          });
          if (res.response.property && extractedInstance)
            //@ts-ignore
            return rev(await extractedInstance[res.response.property]);
          rev(extractedInstance);
        }
      );
    });
  };
  const parts = (await instance.__parentModel)?.split("_");
  instance.$modelPath = modelPath;
  instance.$parentModelPath = parts?.[0];
  instance.$parentId = parts?.[1];
  instance.$parentProperty = parts?.[2];
  instance.$model = Model;
  instance.$id = id;
  instance.$cache = cache || {};
  instance.newParentInstance = async () => {
    return Model.newParentInstance({ childInstance: instance });
  };
  InstanceCache[modelPath + ":" + id] = instance;

  return instance;
}
