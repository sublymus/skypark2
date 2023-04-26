import EventEmiter from './event/eventEmiter.js';
import SQuery, { Validator } from './SQueryClient.js';
//*NEW_ADD
const InstanceCache = {};
const ArrayCache = {}
export const Descriptions = {}

export async function getDescription(modelPath) {
    if (typeof modelPath != 'string') throw new Error('getDescription(' + modelPath + ') is not permit, parameter must be string');
    if (Descriptions[modelPath]) {
        return Descriptions[modelPath]
    }
    return await new Promise((rev) => {
        // //console.//consolelog('********************');
        SQuery.emitNow('server:description', {
            modelPath,
        }, (res) => {
            // //console.log('server:description', res);
            if (res.error) throw new Error(JSON.stringify(res));
            Descriptions[modelPath] = res.response;
            ////*console.log('********************', res);
            rev(Descriptions[modelPath]);
        })
    })
}
export async function getDescriptions() {

    const descriptions = await new Promise((rev) => {
        SQuery.socket.emit('server:descriptions', {}, (res) => {
            if (res.error) throw new Error(JSON.stringify(res));
            ////*console.log('88888888888888888888888888', res);
            rev(res.response);
        })
    })
    for (const key in descriptions) {
        if (Object.hasOwnProperty.call(descriptions, key)) {
            Descriptions[key] = descriptions[key];
        }
    }

    return Descriptions
}
export async function createModelFrom(modelPath) {
    const Model = {}
    const description = await getDescription(modelPath);
    Model.description = description;
    Model.create = async (data, errorCb) => {    ///// verifier si chaque donner est bien rentrer

        if (!errorCb) errorCb = (e) => console.error(e);
        //NEW_ADD
        const validation = await Validator(description, data);
        if (validation.message) {
            // console.error(validation);
            errorCb({
                properties: validation,
            });
            return null
        };
        return await new Promise((rev) => {
            try {
                SQuery.emitNow("model_" + modelPath + ':create', data,
                    async (res) => {
                        try {
                            if (res.error) {
                                errorCb(res);
                                return rev(null);
                            }
                            rev(await createInstanceFrom({ modelPath, id: res.response }))
                        } catch (e) {
                            errorCb(e);
                            return rev(null);
                        }
                    }
                );
            } catch (e) {
                errorCb(e);
                return rev(null);
            }
        })
    };
    /** ****************      Instance      ******************* */
    Model.newInstance = async (data, errorCb) => {
        if (!errorCb) errorCb = (e) => console.error(e);
        let instance = null
        try {
            try {
                // //console.log('*************', { modelPath, id: data.id, description });
                instance = await createInstanceFrom({ modelPath, id: data.id, Model });
            } catch (e) {
                errorCb(e);
            }
        } catch (e) {
            errorCb(e);
        }
        return instance;
    };

    Model.newParentInstance = async ({ childInstance, childId }, errorCb) => {
        if (!errorCb) errorCb = (e) => console.error(e);
        let parentInstance = null
        let parentModelPath;
        let parentId;
        if (!childInstance) {
            childInstance = await createInstanceFrom({ modelPath, id: childId, Model });
        }
        try {
            try {
                parentId = await childInstance['$parentId'];
                parentModelPath = await childInstance['$parentModelPath']
                const parentModel = await SQuery.Model(parentModelPath);
                parentInstance = parentModel.newInstance({ id: parentId });
            } catch (e) {
                errorCb(e);
            }
        } catch (e) {
            errorCb(e);
        }

        return parentInstance;
    };
    Model.update = async (data) => {
        const result = await Validator(description, data);
        if (result.value == undefined) {
            await emitRefresh([property])
            throw new Error('Invalide Value :' + value + ' \n because : ' + result.message);
        }

        return await new Promise((rev, rej) => {
            try {
                SQuery.emitNow("model_" + modelPath + ':update', data,
                    (res) => {
                        try {
                            if (res.error) {
                                console.error(res);
                                return rev(null);
                            }
                            ////*console.log('*************', { modelPath, id: res.response, description });
                            rev(createInstanceFrom({ modelPath, id: res.response, Model }))
                            //restCarte.text.value = JSON.stringify(res);
                        } catch (e) {
                            console.error(res);
                            rev(null)
                            //restCarte.text.value = JSON.stringify(e);
                        }
                    }
                );

            } catch (e) {
                rev(null)
                console.error(e);
                //restCarte.text.value = e;
            }
        })
    }
    return Model;
}

export async function createInstanceFrom({ modelPath, id, Model }) {
 
    if (!id || !modelPath) {
        console.error('id = ' + id, 'modelPath = ' + modelPath);
        return null
    }
    //*NEW_ADD
    if (InstanceCache[modelPath + ":" + id]) {
        return InstanceCache[modelPath + ":" + id];
    }
    //
    let cache = {};
    let propertyCache = {};
    const instance = {};
    const description = await getDescription(modelPath);
    description._id = {
        type: 'String'
    };
    let lastInstanceUpdateAt = 0;
    const emiter = new EventEmiter();
    await (async () => {
        await new Promise((rev) => {
            SQuery.emitNow("model_" + modelPath + ':read', {
                id: id,
            }, async (res) => {
                if (res.error) throw new Error(JSON.stringify(res));
                console.log('--> response:' + "model_" + modelPath + ':read', res);
                cache = res.response
                lastInstanceUpdateAt = cache.updatedAt;
                //  await emitRefresh()
                rev(cache);
            });
        })
    })();
    SQuery.on('update:' + cache._id, async (data) => {
        cache = data.doc;
        lastInstanceUpdateAt = data.doc.updatedAt;
        await emitRefresh(data.properties)
    });
    //////
    async function emitRefresh(properties) {
        emiter.emit('refresh', instance);
        if (properties) {
            properties.forEach(async (p) => {
                emiter.emit('refresh:' + p, await instance[p]);
            });
        } else {
            for (const p in description) {
                if (Object.hasOwnProperty.call(description, p)) {
                    emiter.emit('refresh:' + p, await instance[p]);
                }
            }
        }
    }
    for (const property in description) {
        if (Object.hasOwnProperty.call(description, property)) {
            const rule = description[property];
            let lastPropertyUpdateAt = 0;
            let firstRead = true;
            Object.defineProperties(instance, {
                [property]: {
                    get: async function () {
                        if (rule.ref) {
                            if (firstRead || lastPropertyUpdateAt != lastInstanceUpdateAt) {
                                propertyCache[property] = await createInstanceFrom({ modelPath: rule.ref, id: cache[property], Model })
                                lastPropertyUpdateAt = lastInstanceUpdateAt;
                                firstRead = false
                            }
                            return propertyCache[property];
                        } else if (rule[0] && rule[0].ref) {// invalible
                            if (firstRead) {
                                propertyCache[property] = await createArrayInstanceFrom({ modelPath, id, property, description, Model });
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
                                firstRead = false
                            }
                            return propertyCache[property];
                        } else {
                            if (firstRead || lastPropertyUpdateAt != lastInstanceUpdateAt) {
                                propertyCache[property] = cache[property];
                                lastPropertyUpdateAt = lastInstanceUpdateAt;
                                firstRead = false
                            }
                            return propertyCache[property];
                        }
                    },
                    set: async function (value) {
                        console.log('modelPath:', modelPath, 'value:', value);
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
                            console.log(files);
                            value = files;
                        }
                        const result = await Validator(description[property], value);
                        if (result.value == undefined) {
                            await emitRefresh([property])
                            throw new Error('Invalide Value :' + value + ' \n because : ' + result.message);
                        }
                        try {

                            await instance.update({
                                id,
                                [property]: value,
                            });
                        } catch (error) {
                            console.error(error);
                        }
                        await emitRefresh([property])
                        lastPropertyUpdateAt = cache.updatedAt;
                    },
                },
            });
        }
    }
    instance.update = async (data) => {
        SQuery.emitNow("model_" + modelPath + ':update', {
            ...data,
            id
        }, (res) => {
            if (res.error) {
                throw new Error(JSON.stringify(res));
            }
            cache = res.response;
        })
    }
    //*NEW_ADD
    instance.when = (event,listener,changeRequired) => {
        emiter.when(event,listener,changeRequired);
    };
    //NEW_ADD
    instance.extractor = async (extractorPath) => {
        if (extractorPath == './') return instance;
        if (extractorPath == '../') return await instance.newParentInstance()
        return await new Promise((rev) => {
            SQuery.emit('server:extractor', {
                modelPath,
                id,
                extractorPath
            }, async (res) => {
                if (res.error) throw new Error(JSON.stringify(res));
                console.log(res);
                const extractedModel = await SQuery.Model(res.response.modelPath);
                if (!extractedModel) throw new Error("extractedModel is null for modelPath : " + res.response.modelPath);
                const extractedInstance = await extractedModel.newInstance({ id: res.response.id });
                if (res.response.property) return rev(await extractedInstance[res.response.property]);
                rev(extractedInstance);
            });
        })
    }
    const parts = (await instance.__parentModel).split('_');
    instance.$modelPath = modelPath;
    instance.$parentModelPath = parts[0];
    instance.$parentId = parts[1];
    instance.$parentProperty = parts[2];
    instance.$model = Model;
    instance.$id = await instance._id
    instance.newParentInstance = async () => {
        return Model.newParentInstance({ childInstance: instance })
    }
    console.log('_______________>>>>>>>>', { instance });
    //*NEW_ADD
    InstanceCache[modelPath + ":" + id] = instance;
    return instance;
}
export async function createArrayInstanceFrom({ modelPath: parentModel, id: parentId, property, description }) {
   //*NEW_ADD
    if (ArrayCache[parentModel + "/" + property + ":" + parentId]) {
        return ArrayCache[parentModel + "/" + property + ":" + parentId];
    }
    let currentData = null;
    const emiter = new EventEmiter();
    /**
     emit ('paging data change invalid')
    **/
    let paging = {
        page: 1,
        limit: 20,
        select: '',
        sort: {},
        query: {},
    };

    let itemModelPath = '';
    try {
        itemModelPath = description[property][0].ref;
        if (!itemModelPath) throw new Error("Cannot create a Array Instance with a following description, modelPath = " + itemModelPath);
    } catch (error) {
        throw new Error(error.message);
    }

    const arrayInstance = {};
    SQuery.on('list/' + parentModel + '/' + property + ':' + parentId, async (data) => {
        const modifData = {
            added: data.added,
            removed: data.removed
        };
        Object.defineProperties(modifData, {
             arrayData:{
                get: async()=>{
                    return await refresh();
                },
                set: async()=>{
                    throw new Error('Read Only Property');
                },
             }
        })
        console.log("~ ~ ~ ~ ~ ~ ",{modifData});
        emiter.emit('update', modifData);
    })
    const refresh = async (options) => {


        options = options || {};
        if (options.paging) {
            options.paging = paging = {
                ...paging,
                ...options.paging,
            }
            //console.log(paging);
            //console       emiter.emit('paging', paging);
        } else {
            options.paging = paging;

        }
        //console.log('@@@@@@@@@@@@@@@@@@@@@@@option : ', options);
        options.paging.query = {
            __parentModel: parentModel + '_' + parentId + '_' + property+'_'+itemModelPath,
        }
        //console.log('#####################option : ', options);

        return await new Promise((rev) => {
            if (SQuery.socket.connected) {
                SQuery.emitNow("model_" + itemModelPath + ':list', {
                    ...options,
                    property
                }, async (res) => {
                    if (res.error) throw new Error("****=> " + JSON.stringify(res));
                    currentData = res.response;
                    paging.page = currentData.page;
                    paging.limit = currentData.limit;
                    //*NEW_ADD
                    const itemsInstance =[];
                    //NB: chaque instance dans itemsInstance est cree une fois lors de la lecture de ce instance a index donner. 
                    // et chaque responce du server cree un nouveau currentData or arrayData
                    
                    currentData.items.forEach((item,i) => {
                        let first = true;
                        let instance = null;
                        Object.defineProperties(itemsInstance, {
                            [i]:{
                               get: async()=>{
                                   if (first) {
                                        first = false;
                                        instance = await createInstanceFrom({ modelPath: itemModelPath, id: item._id });
                                   }
                                   console.log('@ @ @ first:', first,'itemsInstance['+i+']',', currentData ',currentData)
                                   return instance;
                               },
                               set: async()=>{
                                   throw new Error('Read Only Property');
                               },
                            }
                       })
                    });
                    currentData.itemsInstance = itemsInstance;
                    //console.log('currentData', currentData);
                    emiter.emit('refresh', currentData);
                    emiter.emit('dataAvalaible', currentData);
                    rev(currentData);
                });
            } else {
                throw new Error("DISCONNECT FROM SERVER")
            }
        })
    }
    arrayInstance.back = async () => {
        //console.log('----back : ');
        if (currentData && currentData.hasPrevPage) {
            paging.page = currentData.prevPage;
            return await refresh();
        } else {
            throw new Error("back() == null; backPage = " + (paging.page - 1) + " ;interval = [ 1 ; " + currentData.totalPages + " ]");
        }
    }
    arrayInstance.next = async () => {
        //console.log('----next : ');
        if (currentData && currentData.hasNextPage) {
            paging.page = currentData.nextPage;
            return await refresh();
        } else {
            throw new Error("next() == null; nextPage = " + (paging.page + 1) + " ;interval = [ 1 ; " + currentData.totalPages + " ]");
        }
    }
    arrayInstance.page = async (page) => {
        if (!page) {
            if (currentData) {
                emiter.emit('dataAvalaible', currentData);
                return currentData;
            }
            return await refresh();
        } else if (currentData && (page > 0 && page <= currentData.totalPages)) {
            paging.page = page;
            return await refresh();
        } else {
            throw new Error("page(" + page + ") == null; page interval = [ 1 ; " + currentData.totalPages + " ]");
        }
    }
    arrayInstance.$itemModelPath = itemModelPath;
    arrayInstance.last = async () => {
        if (paging.page == currentData.totalPages) {
            emiter.emit('dataAvalaible', currentData);
            return currentData;
        }
        paging.page = currentData.totalPages;
        return await refresh();
    }
    arrayInstance.update = async (options) => {
        return await refresh({ ...options });
    }
    arrayInstance.when = (event,listener,changeRequired) => {
        emiter.when(event,listener,changeRequired);
    };
    ArrayCache[parentModel + "/" + property + ":" + parentId] = arrayInstance;
    return arrayInstance;
}

