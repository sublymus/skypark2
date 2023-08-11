import { createArrayInstanceFrom } from "./ArrayInstance";
import EventEmiter, { listenerSchema } from "./event/eventEmiter";

const InstanceCache: any = {};


export async function createInstanceFrom({ modelPath, id, SQuery, _cache }: { modelPath: string, id?: string, SQuery: any, _cache?: { _id: string, __createdAt: number, __updatedAt: number } }) {

  const _id = id || _cache?._id || '';

  const cachKey = modelPath + ":" + _id;

  if (InstanceCache[cachKey]) {
    return InstanceCache[cachKey];
  }
  if (!_id || !modelPath) {
    console.error(`you are trying to read a undefined property, modelPath :${modelPath} , id:${id}, _cache._id:${_cache?._id} `);
    return null;
  }

  const model = await SQuery.createModel(modelPath);
  if(!model){
    console.error('modelPath are not valid');
    return null
  }
  const description = await model.description;

  if(!description){
    console.error('description is missing');
    return null
  }

  let cache: any = _cache;
  let lastInstanceUpdateAt = cache?.__updatedAt || 0;
  const refresh = async () => {
    await new Promise((rev) => {
      SQuery.emit(
        modelPath + ":read",
        {
          id:_id,
        },
        async (res: any) => {
          if (res.error) return console.log(`ERROR_SERVER_RESULT`, JSON.stringify(res));
          cache = res.response;
          //Config.dataStore.setData(modelPath + ":" + id, cache);
          lastInstanceUpdateAt = cache.__updatedAt;
          rev(cache);
        }
      );
    });
  };

  if (!cache) {
    cache = {};
    await refresh();
  }

  const instance: any = {};
  const emiter = new EventEmiter();
  const InstancePropertyCache: {
    [key: string]: {
      value: undefined,
      lastPropertyUpdateAt: 0,
      rule: any,
      firstRead: boolean
    }
  } = {};

  SQuery.on("update:" + _id, async (data: any) => {
    console.log("update:" + _id, data);
    cache = data.doc;
    //Config.dataStore.setData(modelPath + ":" + id, cache);
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

    emiter.emit("refresh", Objproperties);

    if (properties) {
      properties.forEach(async (p: any) => {
        emiter.emit("refresh:" + p, Objproperties);
      });
    } else {
      for (const p in description) {
        if (Object.hasOwnProperty.call(description, p)) {
          emiter.emit("refresh:" + p, Objproperties);
        }
      }
    }
  }
  for (const property in description) {
    if (Object.hasOwnProperty.call(description, property)) {

      InstancePropertyCache[property] = {
        value: undefined,
        lastPropertyUpdateAt: 0,
        rule: description[property],
        firstRead: true
      }
      Object.defineProperties(instance, {
        [property]: {
          get: function () {
            if (InstancePropertyCache[property].rule.ref) {
              return new Promise(async (rev, rej) => {
                console.log(cache[property]);

                if (InstancePropertyCache[property].firstRead || InstancePropertyCache[property].lastPropertyUpdateAt != lastInstanceUpdateAt) {
                  InstancePropertyCache[property].value = await createInstanceFrom({
                    modelPath: InstancePropertyCache[property].rule.ref,
                    id: cache[property],
                    SQuery
                  });
                  InstancePropertyCache[property].lastPropertyUpdateAt = lastInstanceUpdateAt;
                  InstancePropertyCache[property].firstRead = false;
                }
                rev(InstancePropertyCache[property].value);
              })
            } else if (InstancePropertyCache[property].rule[0] && InstancePropertyCache[property].rule[0].ref) {
              // invalible
              return new Promise(async (rev, rej) => {
                if (InstancePropertyCache[property].firstRead) {
                  InstancePropertyCache[property].value = await createArrayInstanceFrom({
                    modelPath,
                    id: _id,
                    property,
                    description,
                    SQuery,
                  });
                  InstancePropertyCache[property].firstRead = false;
                }
                rev(InstancePropertyCache[property].value);
              });
            } else {
              return cache[property];
            }
          },
          set: async function (value) {
            if (value == cache[property]) return;
            if (InstancePropertyCache[property].rule.ref) {
              //il faut just passer la value <id> au server
            } else if (InstancePropertyCache[property].rule[0] && InstancePropertyCache[property].rule[0].ref) {
              // const ai = await instance[property];
              // return await ai.update(value);
            } else if (InstancePropertyCache[property].rule[0] && InstancePropertyCache[property].rule[0].file) {
              const files = [];
              for (const p in value) {
                if (Object.hasOwnProperty.call(value, p)) {
                  const file = value[p];
                  if (file.buffer && file.encoding && file.size && file.type && file.fileName) {
                    const fileData = {
                      fileName: file.fileName,
                      size: file.size,
                      type: file.type,
                      // buffer: await file.arrayBuffer(),
                      buffer: file.buffer,
                      encoding: file.encoding
                    };
                    files.push(fileData);
                  } else if (file.extension && file.url && file.size) {
                    files.push(file);
                  }
                }
              }
              value = files;
            }

            try {
              await instance.update({
                id : _id,
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
    SQuery.emit(
      modelPath + ":update",
      {
        ...data,
        id : _id,
      },
      (res: any) => {
        if (res.error) {
          console.error(`update ERROR , modelPath :${modelPath} , id:${_id}`, JSON.stringify(res));
          return;
        }
        cache = res.response;
        //Config.dataStore.setData(modelPath + ":" + id, cache);
        lastInstanceUpdateAt = cache.__updatedAt;
      }
    );
  };
  instance.when = (event: string, listener: listenerSchema, uid?: string) => {
    if (uid) listener.uid = uid
    return emiter.when(event, listener, false);
  };
  instance.extractor = async (extractorPath: string) => {
    if (extractorPath == "./") return instance;
    if (extractorPath == "../") return await instance.newParentInstance();
    return await new Promise((rev) => {
      SQuery.emit(
        "server:extractor",
        {
          modelPath,
          id: _id,
          extractorPath,
        },
        async (res: {
          error: any;
          response: { modelPath: string; id: any; property: string | number };
        }) => {
          if (res.error) throw new Error(JSON.stringify(res));
          const extractedModel = await SQuery.createModel(res.response.modelPath);
          if (!extractedModel) {
            return rev(null);
          }
          const extractedInstance = await extractedModel.newInstance({
            id: res.response.id,
          });
          if (!extractedInstance) {
            return rev(null);
          }
          if (res.response.property && extractedInstance) {
            return rev(await extractedInstance[res.response.property]);
          }
          rev(extractedInstance);
        }
      );
    });
  };

  const parts = (cache.__parentModel)?.split("_");
  instance.$modelPath = modelPath;
  instance.$parentModelPath = parts?.[0];
  instance.$parentId = parts?.[1];
  instance.$parentProperty = parts?.[2];
  instance.$model = model;
  instance.$id = _id;
  instance.$cache = cache || {};
  instance.getEmiter = () => {
    return emiter;
  };
  instance.newParentInstance = async () => {
    if (!instance.$parentModelPath && !instance.$parentId) return null;
    const parentModel = await SQuery.createModel(instance.$parentModelPath);
    if (!parentModel) return null;
    const parentInstance = await parentModel.newInstance({ id: instance.$parentId });
    return parentInstance;
  };
  InstanceCache[modelPath + ":" + _id] = instance;

  return instance;
}
