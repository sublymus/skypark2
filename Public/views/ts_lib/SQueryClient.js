import { createModelFrom, getDescription, getDescriptions } from './SQueryUtils.js';
const SQuery = {};



const socket = io(null, {
    extraHeaders: {},
});
socket.on("storeCookie", (cookie, cb) => {
    document.cookie = cookie;
    console.log('document.cookie :  ', document.cookie);
    cb(document.cookie)
});

console.log('available cookies:  ', document.cookie);
SQuery.socket = socket;

SQuery.Model = async (modelPath) => {
    return await createModelFrom(modelPath)
}
//NEW_ADD
SQuery.Authentification = async (modelPath) => {
    return await createModelFrom(modelPath)
}
//NEW_ADD
SQuery.isInstance = async (instance) => {
    return instance.$modelPath &&
        instance.$id &&
        instance.newParentInstance &&
        instance.update &&
        instance.when

}
//NEW_ADD
SQuery.isArrayInstance = async (arrayInstance) => {
    return arrayInstance.back &&
        arrayInstance.next &&
        arrayInstance.page &&
        arrayInstance.$itemModelPath &&
        arrayInstance.last &&
        arrayInstance.update &&
        arrayInstance.when
}
//NEW_ADD
SQuery.isFileInstance = async (fileInstance) => {
    return false;
}
//NEW_ADD
export const Global = {}
SQuery.CurrentUserInstance = async () => {
    if (Global.userInstance) return Global.userInstance;
    return await new Promise((rev) => {
        SQuery.emit('server:currentUser', {}, async (res) => {
            if (res.error) rev(null)//throw new Error(JSON.stringify(res));
            const userModel = await SQuery.Model(res.response.signup.modelPath);
            if (!userModel) rev(null)//throw new Error("Model is null for modelPath : " + res.modelPath);
            const userInstance = await userModel.newInstance({ id: res.response.signup.id });
            Global.userInstance = userInstance;
            rev(userInstance);
        });
    })
}
SQuery.emitNow = (event, ...arg) => {
    if (typeof event != 'string') throw new Error('cannot emit with following event : ' + event + '; event value must be string');
    if (SQuery.socket.connected) {
        socket.emit(event, ...arg);
    } else {
        throw new Error("DISCONNECT FROM SERVER");
    }
}
SQuery.emit = (event, ...arg) => {
    if (typeof event != 'string') throw new Error('cannot emit with following event : ' + event + '; event value must be string');
    socket.emit(event, ...arg);
}

SQuery.on = (event, ...arg) => {
    if (typeof event != 'string') throw new Error('cannot emit with following event : ' + event + '; event value must be string');
    socket.on(event, ...arg);
}
SQuery.Description = getDescription;
SQuery.Descriptions = getDescriptions;

// const ActionsMap = {
//     String: {
//         lowerCase: (value, requirement) => {
//             return requirement ? value.toLowerCase() : value;
//         },
//         upperCase: (value, requirement) => {
//             return requirement ? value.toUpperCase() : value;
//         },
//         trim: (value, requirement) => {
//             return requirement ? value.trim() : value;
//         },
//     }
// }
const ValidationMap = {
    String: ['minlength', 'maxlength', 'match', 'enum', 'required'],
    Number: ['min', 'max', 'enum', 'required'],
    Date: ['min', 'max', 'enum', 'required'],
    Array: ['length', 'required'],//////////
}


function isValideType(ruleTypes, type) {
    const typeSide = type.split("/");

    let valide = false;
    Log("type!!", { ruleTypes }, { typeSide });
    ruleTypes.forEach((ruleType) => {
        const ruleSide = ruleType.split("/");
        const match = (side) => {
            Log("type", { ruleSide }, { typeSide });
            if (ruleSide[side] == "*") return true;
            else if (
                ruleSide[side].toLocaleLowerCase() == typeSide[side].toLocaleLowerCase()
            )
                return true;
            else return false;
        };

        if (match(0) && match(1)) {
            valide = true;
        }
    });
    return valide;
}

const validations = {

    minlength: (value, requirement) => {
        let isValide = false;

        if (Array.isArray(requirement)) {
            isValide = value.length >= requirement[0];
        } else {
            isValide = value.length >= requirement;
        }
        return {
            isValide,
            message: isValide ? '' : 'the minimun Length is ' + requirement,
        };
    },
    maxlength: (value, requirement) => {
        let isValide = false;
        if (Array.isArray(requirement)) {
            isValide = value.length <= requirement[0];
        } else {
            isValide = value.length <= requirement;
        }
        return {
            isValide,
            message: isValide ? '' : 'the maximum Length is ' + requirement,
        };
    },
    min: (value, requirement) => {
        const isValide = value >= requirement;
        return {
            isValide,
            message: isValide ? '' : 'the minimum value is ' + requirement,
        };
    },
    max: (value, requirement) => {
        const isValide = value <= requirement;
        return {
            isValide,
            message: isValide ? '' : 'the maximum value is ' + requirement,
        };
    },
    match: (value, requirement) => {
        //console.log(requirement);
        const re = new RegExp(requirement);
        const isValide = re.test(value);
        return {
            isValide,
            message: isValide ? '' : 'the value must be Match with : ' + requirement,
        };
    },
    enum: (value, requirement) => {
        const isValide = requirement.includes(value);
        return {
            isValide,
            message: isValide ? '' : 'the value must be included in : ' + requirement,
        };
    },
    file: (value, requirement) => {
        //console.log('value.type', value.type, 'isValide', isValideType(requirement.type || ['*/*'], value.type));
        if (value.type && isValideType(requirement.type || ['*/*'], value.type)) {
            return {
                isValide: false,
                message: isValide ? '' : 'the value must be included in : ' + requirement,
            };
        }
        return true;
    },
    type: async (value, requirement) => {
        if (requirement == 'Boolean') {
            if (value == 'true' || value == 'false' || value === true || value === false) return { isValide: true };
            return {
                isValide: false,
                message: 'the type of value bust be : ' + requirement,
            };
        }
        else if (requirement == 'Number') {
            try {
                if (!Number.isNaN(Number(value))) return { isValide: true, err: Number(value) };
                return {
                    isValide: false,
                    message: 'the type of value bust be : ' + requirement,
                };
            } catch (error) {
                return {
                    isValide: false,
                    message: 'the type of value bust be : ' + requirement,
                };
            }
        }
        else if (requirement == 'String') {
            return {
                isValide: true,
            };
        }
        else if (requirement == 'Date') {
            try {
                if (new Date(value)) return { isValide: true };
                return {
                    isValide: false,
                    message: 'the type of value bust be : ' + requirement,
                };
            } catch (error) {
                return {
                    isValide: false,
                    message: 'the type of value bust be : ' + requirement,
                };
            }
        }
        else if (requirement == 'array') {////////////////////////////////////////
            try {
                if (Array.isArray(value)) return { isValide: true };
                return {
                    isValide: false,
                    message: 'the type of value bust be : ' + requirement,
                };
            } catch (error) {
                return {
                    isValide: false,
                    message: 'the type of value bust be : ' + requirement,
                };
            }
        }
       
        return {
            isValide: true,
        };
    },
    required: (value, requirement) => {
        let isValide = true;
        if (requirement) {
            isValide = (value == undefined || value == null || value == '') ? false : true;
        }
        return {
            isValide,
            message: 'the value is required',
        }
    }
}
// NEW_ADD
export const Validator = async (rule, value) => {
    let res = await validations.type(value, rule.type);
    //console.log('rule : ', rule, 'value : ', value, 'res: ', res);
    if (!res.isValide) return {
        message: res.message,
        // e: //console.log('res: ', { res })
    };

    if (ValidationMap[rule.type]) {
        for (const p of ValidationMap[rule.type]) {
            if (rule[p] && validations[p]) {
                //console.log('rule[p] : ', rule[p], 'value : ', validations[p](value, rule[p]));
                if (!(res = validations[p](value, rule[p])).isValide) return {
                    message: res.message,
                    //e: console.log('res: ', { res })
                };

            }
        }
    }
    if (rule.file) {
        if (!(res = validations.file(value, rule.file)).isValide) return {
            message: res.message,
            //e: //console.log('res: ', { res })
        };
    }

    // if (ActionsMap[rule.type]) {
    //     const actions = ActionsMap[rule.type];
    //     //console.log(ActionsMap[rule.type]);
    //     for (const p in actions) {
    //         if (rule[p] && actions[p]) {
    //             value = actions[p](value, rule[p]);
    //         }
    //     }
    // }

    return {
        value
    };
}
export default SQuery;

// function getIP(callback){
//     fetch('https://api.ipregistry.co/?key=tryout')
//       .then(response => response.json())
//       .then(data => callback(data));
//   }
//   getIP(function(ip){
//   //console.log(ip);

//   });

