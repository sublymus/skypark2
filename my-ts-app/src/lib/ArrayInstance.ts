import EventEmiter, { listenerSchema } from "./event/eventEmiter";
import { createInstanceFrom } from "./Instance";


const ArrayCache: any = {};

export async function createArrayInstanceFrom({
  modelPath: parentModel,
  id: parentId,
  property,
  description,
  SQuery
}: any) {
  let currentData: any = null;
  if (ArrayCache[parentModel + "/" + property + ":" + parentId]) {
    return ArrayCache[parentModel + "/" + property + ":" + parentId];
  }
  const emiter = new EventEmiter();

  let paging = {
    page: 1,
    limit: 20,
    select: "",
    sort: {},
    query: {},
  };

  let itemModelPath = description[property]?.[0]?.ref;
  if (!itemModelPath) {
    console.log(`%c CLIENT_ERROR %c createArrayInstanceFrom'`, 'font-weight: bold; font-size: 14px;color: orange; ', 'font-weight: bold; font-size: 20px;color: red; ');
    console.log(`%c the property=${property} is not a array of model reference`, 'background: #3455; ');
    return
  }

  const arrayInstance: any = {};
  SQuery.on(
    "list/" + parentModel + "/" + property + ":" + parentId,
    async (data: { added: any; removed: any }) => {
      const modifData = {
        added: data.added,
        removed: data.removed,
      };
      Object.defineProperties(modifData, {
        arrayData: {
          get: async () => {
            return await refresh();
          },
          set: async () => {
            console.log(`%c CLIENT_ERROR %c wrong action`, 'font-weight: bold; font-size: 14px;color: orange; ', 'font-weight: bold; font-size: 20px;color: red; ');
            console.log(`%c params.arrayData is a readOnly property , `, 'background: #3455; ');
          },
        },
      });
      emiter.emit("update", modifData);
    }
  );
  const refresh = async (options?: any) => {
    options = options || {};
    if (options.paging) {
      options.paging = paging = {
        ...paging,
        ...options.paging,
      };
    } else {
      options.paging = paging;
    }
    options.paging.query = {
      __parentModel: parentModel + "_" + parentId + "_" + property,
    };

    return await new Promise((rev) => {
        SQuery.emit(
          itemModelPath + ":list",
          {
            ...options,
            property,
          },
          async (res: any) => {
            if (res.error) {
              console.log(`%c ERROR_SERVER %c ${itemModelPath}:${'list'}`, 'font-weight: bold; font-size: 14px;color: orange; ' ,'font-weight: bold; font-size: 20px;color: red; ');
              console.log(`%c ${JSON.stringify(res)}`,'background: #3455; ');
              return;
            };
            currentData = res.response;
            paging.page = currentData.page;
            paging.limit = currentData.limit;
            const itemsInstance: any[] = [];
            //NB: chaque instance dans itemsInstance est cree une fois lors de la lecture de ce instance a index donner.
            // et chaque responce du server cree un nouveau currentData or arrayData

            // let t = {}
            currentData.items.forEach((item: { _id: any }, i: any) => {
              let first = true;
              let instance: null = null;
              Object.defineProperties(itemsInstance, {
                [i]: {
                  get: async () => {
                    //console.log('@ @ @ first:', first,'itemsInstance['+i+']',', currentData ', t);
                    if (first) {
                      first = false;
                      instance = await createInstanceFrom({
                        SQuery,
                        modelPath: itemModelPath,
                        id: item._id,
                      });
                      // t[i] = instance;
                    }
                    return instance;
                  },
                  set: async () => {
                    console.log(`%c CLIENT_ERROR %c wrong action`, 'font-weight: bold; font-size: 14px;color: orange; ', 'font-weight: bold; font-size: 20px;color: red; ');
                    console.log(`%c arraData.itemsInstance is a readOnly array property , `, 'background: #3455; ');
                  },
                },
              });
            });
            currentData.itemsInstance = itemsInstance;
            emiter.emit("refresh", currentData);
            rev(currentData);
          }
        );
    });
  };
  arrayInstance.back = async () => {
    if (currentData && currentData.hasPrevPage) {
      paging.page = currentData.prevPage;
      return await refresh();
    } else {
      console.log(`%c CLIENT_ERROR %c wrong action`, 'font-weight: bold; font-size: 14px;color: orange; ', 'font-weight: bold; font-size: 20px;color: red; ');
      console.log(`%cback() == null; backPage = ${paging.page - 1 }) ;interval = [ 1 ;  ${currentData.totalPages }  ]`, 'background: #3455; ');
    }
  };
  arrayInstance.next = async () => {
    if (currentData && currentData.hasNextPage) {
      paging.page = currentData.nextPage;
      return await refresh();
    } else {
      console.log(`%c CLIENT_ERROR %c wrong action`, 'font-weight: bold; font-size: 14px;color: orange; ', 'font-weight: bold; font-size: 20px;color: red; ');
      console.log(`%c next() == null; nextPage =${paging.page + 1}, interval = [ 1 ; ${currentData.totalPages}  ]`, 'background: #3455; ');
    }
  };
  arrayInstance.page = async (page: number) => {
    if (!page) {
      if (currentData) {
        emiter.emit("refresh", currentData);
        return currentData;
      }
      return await refresh();
    } else if (currentData && page > 0 && page <= currentData.totalPages) {
      paging.page = page;
      return await refresh();
    } else {
      console.log(`%c CLIENT_ERROR %c wrong action`, 'font-weight: bold; font-size: 14px;color: orange; ', 'font-weight: bold; font-size: 20px;color: red; ');
      console.log(`%c page(${page }) == null; page interval = [ 1 ; ${currentData.totalPages}  ]`, 'background: #3455; ');
    }
  };
  arrayInstance.$itemModelPath = itemModelPath;
  arrayInstance.last = async () => {
    if (paging.page == currentData.totalPages) {
      emiter.emit("refresh", currentData);
      return currentData;
    }
    paging.page = currentData.totalPages;
    return await refresh();
  };
  arrayInstance.update = async (options: any) => {
    return await refresh({ ...options });
  };
  arrayInstance.when = (
    event: string,
    listener: listenerSchema,
    uid?:string
  ) => {
    if(uid) listener.uid = uid;
    emiter.when(event, listener, false);
  };
  ArrayCache[parentModel + "/" + property + ":" + parentId] = arrayInstance;
  return arrayInstance;
}
