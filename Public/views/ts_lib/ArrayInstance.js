import EventEmiter from './event/eventEmiter.js';
import { createInstanceFrom } from './Instance.js';
import SQuery from './SQueryClient.js';

const ArrayCache = {};

export async function createArrayInstanceFrom({ modelPath: parentModel, id: parentId, property, description }) {
    
    let currentData = null;
     if (ArrayCache[parentModel + "/" + property + ":" + parentId]) {
         return ArrayCache[parentModel + "/" + property + ":" + parentId];
     }
     const emiter = new EventEmiter();
     
     let paging = {
         page: 1,
         limit: 20,
         select: '',
         sort: {},
         query: {},
     };
 
     let itemModelPath = '';
     try {
         itemModelPath = description[property]?.[0]?.ref;
         if (!itemModelPath) throw new Error("Cannot create a Array Instance, property= " + property+" is not a array instance");
     } catch (error) {
         throw new Error(error.message);
     }
 
     const arrayInstance = {};
     SQuery.on('list/' + parentModel + '/' + property + ':' + parentId, async (data) => {
         const modifData = {
             added: data.added,
             removed: data.removed,
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
         });
         emiter.emit('update', modifData);
     })
     const refresh = async (options) => {
         options = options || {};
         if (options.paging) {
             options.paging = paging = {
                 ...paging,
                 ...options.paging,
             }
         } else {
             options.paging = paging;
 
         }
         options.paging.query = {
             __parentModel: parentModel + '_' + parentId + '_' + property,
         }
 
         return await new Promise((rev) => {
             if (SQuery.socket.connected) {
                 SQuery.emit( itemModelPath + ':list', {
                     ...options,
                     property
                 }, async (res) => {
                     if (res.error) throw new Error("****=> " + JSON.stringify(res));
                     currentData = res.response;
                     paging.page = currentData.page;
                     paging.limit = currentData.limit;
                     const itemsInstance =[];
                     //NB: chaque instance dans itemsInstance est cree une fois lors de la lecture de ce instance a index donner. 
                     // et chaque responce du server cree un nouveau currentData or arrayData
                     
                    // let t = {}
                     currentData.items.forEach((item,i) => {
                         let first = true;
                         let instance = null;
                         Object.defineProperties(itemsInstance, {
                             [i]:{
                                get: async()=>{
                                    //console.log('@ @ @ first:', first,'itemsInstance['+i+']',', currentData ', t);
                                    if (first) {
                                         first = false;
                                         instance = await createInstanceFrom({ modelPath: itemModelPath, id: item._id });
                                        // t[i] = instance;
                                    }
                                    return instance;
                                },
                                set: async()=>{
                                    throw new Error('Read Only Property');
                                },
                             }
                        })
                     });
                     currentData.itemsInstance = itemsInstance;
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
         if (currentData && currentData.hasPrevPage) {
             paging.page = currentData.prevPage;
             return await refresh();
         } else {
             throw new Error("back() == null; backPage = " + (paging.page - 1) + " ;interval = [ 1 ; " + currentData.totalPages + " ]");
         }
     }
     arrayInstance.next = async () => {
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
 
 