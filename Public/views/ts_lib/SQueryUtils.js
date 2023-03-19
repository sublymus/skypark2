import EventEmiter from './event/eventEmiter.js';
import SQuery from './SQueryClient.js';

export const Descriptions = {}

export async function getDesription(modelPath) {
    if (typeof modelPath != 'string') throw new Error('getDesription(' + modelPath + ') is not permit, parameter must be string');
    if (Descriptions[modelPath]) {
        return Descriptions[modelPath]
    }
    return await new Promise((rev) => {
        // console.log('********************');
        SQuery.emit('server:description', {
            modelPath,
        }, (res) => {
            console.log('server:description', res);
            if (res.error) throw new Error(JSON.stringify(res));
            Descriptions[modelPath] = res.response;
            //console.log('********************', res);
            rev(Descriptions[modelPath]);
        })
    })
}
export async function createModelFrom(modelPath) {
    const Model = {}
    const description = await getDesription(modelPath);
    Model.description = description;
    Model.create = async (data, errorCb) => {    ///// verifier si chaque donner est bien rentrer

        if (!errorCb) errorCb = (e) => console.error(e);
        const validation = SQuery.Validatior(description, data);
        if (validation.message) {
            // console.error(validation);
            errorCb({
                properties: validation,
            });
            return null
        };
        return await new Promise((rev) => {
            try {
                SQuery.emit("model_" + modelPath + ':create', data,
                    async (res) => {
                        try {
                            if (res.error) {
                                errorCb({
                                    server: res,
                                });
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
    Model.instance = async (data, errorCb) => {
        if (!errorCb) errorCb = (e) => console.error(e);
        let instance = null
        try {
            try {
                // console.log('*************', { modelPath, id: data.id, description });
                instance = await createInstanceFrom({ modelPath, id: data.id, description });
            } catch (e) {
                errorCb(e);
            }
        } catch (e) {
            errorCb(e);
        }
        return instance;
    };
    Model.update = async (data) => {
        const validation = dataValidator('update', description, data);
        if (validation != true) {
            console.error(validation);
            return null;
        };
        return await new Promise((rev, rej) => {
            try {
                SQuery.emit("model_" + modelPath + ':update', data,
                    (res) => {
                        try {
                            if (res.error) {
                                console.error(res);
                                return rev(null);
                            }
                            //console.log('*************', { modelPath, id: res.response, description });
                            rev(createInstanceFrom({ modelPath, id: res.response, description }))
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
export async function createInstanceFrom({ modelPath, id }) {
    let cache = {};
    let propertyCache = {};
    const instance = {};

    const description = await getDesription(modelPath);
    description._id = {
        type: 'String'
    };

    let lastInstanceUpdateAt = 0;
    const emiter = new EventEmiter();
    const refresh = async () => {
        await new Promise((rev) => {
            SQuery.emit("model_" + modelPath + ':read', {
                id: id,
            }, (res) => {
                if (res.error) throw new Error(JSON.stringify(res));
                console.log(res);
                cache = res.response
                lastInstanceUpdateAt = cache.updatedAt;
                emitRefresh(['name'])
                rev(cache);
            });

        })
    };
    await refresh();
    SQuery.on('update:' + cache._id, async (data) => {
        console.log(data);
        console.log('last : ' + lastInstanceUpdateAt, 'data update At  :' + data.doc.updatedAt);
        console.log('now : ' + lastInstanceUpdateAt, 'data update At  :' + data.doc.updatedAt);
        console.log('data.properties : ' + data.properties);
        cache = data.doc;
        lastInstanceUpdateAt = data.doc.updatedAt;
        emitRefresh(data.properties)

    })
    //////
    function emitRefresh(properties) {
        emiter.emit('refresh', properties);
        if (properties) {
            properties.forEach(p => {
                emiter.emit('refresh:' + p, p);
            });
        } else {
            for (const p in description) {
                if (Object.hasOwnProperty.call(description, p)) {
                    emiter.emit('refresh:' + p, p);
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
                                propertyCache[property] = await createInstanceFrom({ modelPath: rule.ref, id: cache[property] })
                                lastPropertyUpdateAt = lastInstanceUpdateAt;
                                firstRead = false
                                console.log('get:propertyCache[' + property + ']', { propertyCache, cache });
                            }
                            return propertyCache[property];
                        } else if (rule[0] && rule[0].ref) {// invalible
                            if (firstRead) {
                                propertyCache[property] = await createArrayInstanceFrom({ modelPath, id, property, description });
                                firstRead = false;
                            } else if (lastPropertyUpdateAt != lastInstanceUpdateAt) {
                                propertyCache[property].update();
                                lastPropertyUpdateAt = lastInstanceUpdateAt;
                                console.log('get:propertyCache[' + property + ']', { propertyCache, cache });
                            }
                            return propertyCache[property];
                        } else if (rule[0]) {
                            if (firstRead || lastPropertyUpdateAt != lastInstanceUpdateAt) {
                                propertyCache[property] = cache[property];
                                lastPropertyUpdateAt = lastInstanceUpdateAt;
                                firstRead = false
                                console.log('get:propertyCache[' + property + ']', { propertyCache, cache });
                            }
                            return propertyCache[property];
                        } else {
                            if (firstRead || lastPropertyUpdateAt != lastInstanceUpdateAt) {
                                propertyCache[property] = cache[property];
                                lastPropertyUpdateAt = lastInstanceUpdateAt;
                                firstRead = false
                                console.log('get:propertyCache[' + property + ']', { propertyCache, cache });
                            }
                            return propertyCache[property];
                        }
                    },
                    set: async function (value) {
                        if (value == cache[property]) return;
                        if (rule.ref) {

                            // on vouloire changer l'id stocker dans une proprieter, cella de doit etre permis ou non
                            return console.error('ReadOnly modelInstance["refProperty"], Exemple: const modelInstance =  await modelInstance["refProperty"] ');
                        } else if (rule[0] && rule[0].ref) {
                            const ai = await instance[property];
                            //console.log('array instance avant .update(conf)', ai);
                            return await ai.update(value);
                        } else if (rule[0] && rule[0].file) {
                            const files = [];
                            for (const p in value) {
                                if (Object.hasOwnProperty.call(value, p)) {
                                    const file = value[p];
                                    const fileData = {
                                        fileName: file.name,
                                        size: file.size,
                                        type: file.type,
                                        buffer: await file.arrayBuffer(),
                                    };
                                    files.push(fileData);
                                }
                            }
                            value = files;
                        }
                        const result = SQuery.Validatior(description[property], value);
                        if (result.value == undefined) {
                            throw new Error('Invalide Value :' + value + ' \n because : ' + result.message);
                        }

                        SQuery.emit("model_" + modelPath + ':update', {
                            id,
                            [property]: value,
                        }, (res) => {
                            //console.log('update', 'modelPath : ', modelPath, 'property : ', property);
                            //console.log(res);
                            if (res.error) {
                                throw new Error(JSON.stringify(res));
                            }
                            cache[property] = res.response[property];
                        })
                    },
                },
            });
        }
    }

    instance.id = instance._id
    instance.update = async (data) => {
        SQuery.emit("model_" + modelPath + ':update', data, (res) => {
            //console.log('update', 'modelPath : ', modelPath, 'property : ', property);
            //console.log(res);
            if (res.error) {
                throw new Error(JSON.stringify(res));
            }
            cache = res.response;
        })
    }
    instance.when = (...arg) => {
        emiter.when(...arg);
    };
    return instance;
}
export async function createArrayInstanceFrom({ modelPath: parentModel, id: parentId, property, description }) {
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
    const refresh = async (options) => {

        options = options || {};

        if (options.paging) {
            options.paging = paging = {
                ...paging,
                ...options.paging,
            }
            console.log(paging);
            emiter.emit('paging', paging);
        } else {
            options.paging = paging
        }
        options.paging.query = {
            __parentModel: parentModel + '_' + parentId + '_' + property,
        }

        return await new Promise((rev) => {
            if (SQuery.socket.connected) {
                SQuery.emit("model_" + itemModelPath + ':list', {
                    ...options,
                    property
                }, async (res) => {
                    if (res.error) throw new Error("****=> " + JSON.stringify(res));
                    currentData = res.response;
                    paging.page = currentData.page;
                    paging.limit = currentData.limit;
                    emiter.emit('data', currentData);
                    emiter.emit('change', currentData);

                    Object.defineProperties(currentData, {
                        ['itemsInstance']: {
                            get: async () => {
                                if (currentData['#itemsInstance']) {
                                    return currentData['#itemsInstance'];
                                }
                                const promises = currentData.items.map((item) => {
                                    return new Promise(async (rev) => {
                                        const instance = await createInstanceFrom({ modelPath: itemModelPath, id: item._id });
                                        rev(instance);
                                    })
                                });
                                const itemsInstance = (await Promise.allSettled(promises)).map((p) => {
                                    return p.value || null;
                                }).filter(itemInstance => {
                                    return !!itemInstance;
                                });
                                console.log(itemsInstance);
                                return currentData['#itemsInstance'] = itemsInstance;
                            },
                            set: async () => {
                                console.error('ReadOnly ArrayData["itemsInstance"] ');
                            }
                        }
                    })
                    console.log('currentData', currentData);

                    rev(currentData);
                });
            } else {
                throw new Error("DISCONNECT FROM SERVER")
            }
        })
    }
    const data = await refresh();
    arrayInstance.back = async () => {
        console.log('----back : ');
        if (currentData && currentData.hasPrevPage) {
            paging.page = currentData.prevPage;
            return await refresh();
        } else {
            throw new Error("back() == null; backPage = " + (paging.page - 1) + " ;interval = [ 1 ; " + currentData.totalPages + " ]");
        }
    }
    arrayInstance.next = async () => {
        console.log('----next : ');
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
                emiter.emit('data', currentData);
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
    arrayInstance.last = async () => {
        if (paging.page == currentData.totalPages) {
            emiter.emit('data', currentData);
            return currentData;
        }
        paging.page = currentData.totalPages;
        return await refresh();
    }
    arrayInstance.update = async (options) => {
        console.log('options : ', options);
        return await refresh(options);
    }
    arrayInstance.when = (...arg) => {
        emiter.when(...arg);
    };
    return arrayInstance;
}

