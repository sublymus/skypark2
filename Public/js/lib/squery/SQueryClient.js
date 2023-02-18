const SQuery = {};
const socket = io(null, {
  extraHeaders: {},
});
/*
const validations = {
    
    minLength: (value, requirement) => {
        return value.length >= requirement;
    },
    maxLength: (value, requirement) => {
        return value.length <= requirement;
    },
    min: (value, requirement) => {
        return value >= requirement;
    },
    max: (value, requirement) => {
        return value <= requirement;
    },
    match: (value, requirement) => {
        const re = new RegExp(requirement, "g");
        return value.match(re);
    },
    enum: (value, requirement) => {
        return requirement.includes(value);
    },
    type: (value, requirement) => {
        // date = number 
        // boolean
        // string
        // schema = object'structurer'
        // array of '^'
        // objectID
        return typeof value == '';
    },
    require: (value, requirement) => {
        return requirement && value ;
    }
}


const Models = {

}

async function createModel(){
    
}

SQuery.getModels = async (modelPath, id) => {
    return await new Promise((resolve, reject)=>{
        
        socket.emit('_$server_model', { }, (res) => {
            if (res.error) return console.error(res.message)||resolve(null);
            const createList = [];
            res.response.forEach((modelInfo)=>{
                createList.push(createModel(modelInfo));
            })
            Promise.allSettled()
        })
       
    })
}










SQuery.models = (...modelsPath) => {
    modelsPath.forEach((modelPath) => {
        const modelName = modelPath.chartAt(0).toUpperCase() + modelPath.substring(1) + 'Model';
        if (Models[modelName]) return
        socket.emit('server-model', { modelPath }, (res) => {
            if (res.error) return console.error(res.message);
            Models[modelName] = {
                create: async (data) => {
                    socket.emit(
                        modelPath,
                        {
                            ...data,
                            _server_action: 'create',
                        },
                        (res) => {
                            if (action == "create" && modelPath == "user")
                                userId = res;
                            if (action == "create") modelId = res;
                            try {
                                console.log(res);
                                restCarte.text.value = JSON.stringify(res);
                            } catch (e) {
                                restCarte.text.value = e;
                            }
                        }
                    )
                }
            };
        });
    })
}
*/

// function getIP(callback){
//     fetch('https://api.ipregistry.co/?key=tryout')
//       .then(response => response.json())
//       .then(data => callback(data));
//   }
//   getIP(function(ip){
//   console.log(ip);

//   });

socket.on("storeCookie", (cookie) => {
  document.cookie = cookie;
});

SQuery.socket = socket;
export default SQuery;
