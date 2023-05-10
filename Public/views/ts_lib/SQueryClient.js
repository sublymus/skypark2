import { Config } from "./Config.js";
import {
  createModelFrom,
} from "./Model.js";


const Descriptions = {};

const socket = io(null, {
  extraHeaders: {},
});


socket.on("storeCookie", (cookie, cb) => {
  document.cookie = cookie;
  console.log("document.cookie :  ", document.cookie);
  cb(document.cookie);
});

console.log("available cookies:  ", document.cookie);

export const Global = {};

const SQuery = {
  model: async (modelPath) => {
    return await createModelFrom(modelPath);
  },
  authentification: async (modelPath) => {
    return await createModelFrom(modelPath);
  },
  socket,
  isInstance: async (instance) => {
    return (
      instance.$modelPath &&
      instance.$id &&
      instance.newParentInstance &&
      instance.update &&
      instance.when
    );
  },
  isArrayInstance: async (arrayInstance) => {
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
  isFileInstance: async (fileInstance) => {
    return false;
  },
  currentUserInstance: async () => {
    if (Global.userInstance) return Global.userInstance;
    return await new Promise((rev) => {
      SQuery.emit("server:currentUser", {}, async (res) => {
        if (res.error) rev(null); //throw new Error(JSON.stringify(res));
        const userModel = await SQuery.model(res.response.signup.modelPath);
        if (!userModel) rev(null); //throw new Error("Model is null for modelPath : " + res.modelPath);
        const userInstance = await userModel.newInstance({
          id: res.response.signup.id,
        });
        Global.userInstance = userInstance;
        rev(userInstance);
      });
    });
  },
  emitNow: (event, ...arg) => {
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
  emit: (event, ...arg) => {
    if (typeof event != "string")
      throw new Error(
        "cannot emit with following event : " +
        event +
        "; event value must be string"
      );
    socket.emit(event, ...arg);
  },
  on: (event, ...arg) => {
    if (typeof event != "string")
      throw new Error(
        "cannot emit with following event : " +
        event +
        "; event value must be string"
      );
    socket.on(event, ...arg);
  },
  getDescription: async function (modelPath) {
    if (typeof modelPath != 'string') throw new Error('getDescription(' + modelPath + ') is not permit, parameter must be string');
    if (Descriptions[modelPath]) {
      return Descriptions[modelPath]
    } else if (Config.dataStore.useStore) {
      const data = await Config.dataStore.getData('server:description:' + modelPath, Descriptions[modelPath]);
      if (data) {
        return Descriptions[modelPath] = data;
      }
    }
    return await new Promise((rev) => {
      // //console.//consolelog('********************');
      SQuery.emit('server:description', {
        modelPath,
      }, (res) => {
        // //console.log('server:description', res);
        if (res.error) throw new Error(JSON.stringify(res));
        Descriptions[modelPath] = res.response;
        Config.dataStore.setData('server:description:' + modelPath, Descriptions[modelPath])
        rev(Descriptions[modelPath]);
      })
    })
  },
  getDescriptions: async function () {
    let descriptions;
    const data = await Config.dataStore.getData('server:descriptions');
    if (/*Config.dataStore.useStore*/ false && data) {
        descriptions = data;
    }else {
      descriptions = await new Promise((rev) => {
        SQuery.emit('server:descriptions', {}, (res) => {
          if (res.error) throw new Error(JSON.stringify(res));
          rev(res.response);
        })
      });
      Config.dataStore.setData('server:descriptions', descriptions);
    }

    for (const modelPath in descriptions) {
      if (Object.hasOwnProperty.call(descriptions, modelPath)) {
        Descriptions[modelPath] = descriptions[modelPath];
        Config.dataStore.setData('server:description:' + modelPath, descriptions[modelPath]);
      }
    }
    return Descriptions
  },

  set dataStore(value) {
    Config.dataStore = {
      ...Config.dataStore,
      ...value
    }
  },
  get dataStore() {
    return Config.dataStore;
  },

  service: async (ctrl,service, data) => {
    return await new Promise((rev) => {
      SQuery.emit(ctrl+':'+service, data, async (res) => {
        if (res.error) {
          rev(null);
          throw new Error(JSON.stringify(res));
        }
        rev(res.response);
      });
    });
  }
};

export default SQuery;

// function getIP(callback){
//     fetch('https://api.ipregistry.co/?key=tryout')
//       .then(response => response.json())
//       .then(data => callback(data));
//   }
//   getIP(function(ip){
//   //console.log(ip);

//   });
