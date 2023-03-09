import { createModelFrom, getDesription } from './SQueryUtils.js';
const SQuery = {};

const socket = io(null, {
    extraHeaders: {},
});

socket.on("storeCookie", (cookie) => {
    document.cookie = cookie;
});

SQuery.socket = socket;

SQuery.Model = async (modelPath) => {

    return await createModelFrom(modelPath)
}
SQuery.getDesription = getDesription;

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
        console.log(requirement);
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
        return true;
    },
    type: (value, requirement) => {
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
        else if (requirement == 'ObjectId') {
            try {
                new Promise(rev => {
                    SQuery.socket.emit('server:valideId', { id: value }, (res) => {
                        rev(!!res.response);
                    })
                })
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

SQuery.Validatior = (rule, value) => {
    let res = validations.type(value, rule.type);
    console.log('rule : ', rule, 'value : ', value, 'res: ', res);
    if (!res.isValide) return {
        message: res.message,
        e: console.log('res: ', res)
    };

    if (ValidationMap[rule.type]) {
        for (const p of ValidationMap[rule.type]) {
            if (rule[p] && validations[p]) {
                console.log('rule[p] : ', rule[p], 'value : ', validations[p](value, rule[p]));
                if (!(res = validations[p](value, rule[p])).isValide) return {
                    message: res.message,
                    e: console.log('res: ', res)
                };

            }
        }
    }
    if (rule.file) {
        if (!(res = validations.file(value, rule.file)).isValide) return {
            message: res.message,
            e: console.log('res: ', res)
        };
    }

    // if (ActionsMap[rule.type]) {
    //     const actions = ActionsMap[rule.type];
    //     console.log(ActionsMap[rule.type]);
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
//   console.log(ip);

//   });

