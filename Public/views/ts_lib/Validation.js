const ValidationMap = {
    String: ["minlength", "maxlength", "match", "enum", "required"],
    Number: ["min", "max", "enum", "required"],
    Date: ["min", "max", "enum", "required"],
    Array: ["length", "required"],
  };
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
        message: isValide ? "" : "the minimun Length is " + requirement,
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
        message: isValide ? "" : "the maximum Length is " + requirement,
      };
    },
    min: (value, requirement) => {
      const isValide = value >= requirement;
      return {
        isValide,
        message: isValide ? "" : "the minimum value is " + requirement,
      };
    },
    max: (value, requirement) => {
      const isValide = value <= requirement;
      return {
        isValide,
        message: isValide ? "" : "the maximum value is " + requirement,
      };
    },
    match: (value, requirement) => {
      //console.log(requirement);
      const re = new RegExp(requirement);
      const isValide = re.test(value);
      return {
        isValide,
        message: isValide ? "" : "the value must be Match with : " + requirement,
      };
    },
    enum: (value, requirement) => {
      const isValide = requirement.includes(value);
      return {
        isValide,
        message: isValide ? "" : "the value must be included in : " + requirement,
      };
    },
  
    type: async (value, requirement) => {
      if (requirement == "Boolean") {
        if (
          value == "true" ||
          value == "false" ||
          value === true ||
          value === false
        ) {
          return { isValide: true }
        };
        return {
          message: "the type of value bust be : " + requirement,
        };
      } else if (requirement == "Number") {
        try {
          if (!Number.isNaN(Number(value)))
            return { isValide: true, err: Number(value) };
          return {
            isValide: false,
            message: "the type of value bust be : " + requirement,
          };
        } catch (error) {
          return {
            isValide: false,
            message: "the type of value bust be : " + requirement,
          };
        }
      } else if (requirement == "String") {
        return {
          isValide: true,
        };
      } else if (requirement == "Date") {
        try {
          if (new Date(value)) return { isValide: true };
          return {
            isValide: false,
            message: "the type of value bust be : " + requirement,
          };
        } catch (error) {
          return {
            isValide: false,
            message: "the type of value bust be : " + requirement,
          };
        }
      } else if (requirement == "array") {
        ////////////////////////////////////////
        try {
          if (Array.isArray(value)) return { isValide: true };
          return {
            isValide: false,
            message: "the type of value bust be : " + requirement,
          };
        } catch (error) {
          return {
            isValide: false,
            message: "the type of value bust be : " + requirement,
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
        isValide =
          value == undefined || value == null || value == "" ? false : true;
      }
      return {
        isValide,
        message: "the value is required",
      };
    },
  };
  export const Validator = async (rule, value) => {
    let res = await validations.type(value, rule.type);
    //console.log('rule : ', rule, 'value : ', value, 'res: ', res);
    if (!res.isValide) {
      console.log('is NOT valide : ', 'rule : ', rule, 'value : ', value, 'res: ', res);
      return {
        message: res.message,
      };
    }
    if (ValidationMap[rule.type]) {
      for (const p of ValidationMap[rule.type]) {
        if (rule[p] && validations[p]) {
          if (!(res = validations[p](value, rule[p])).isValide) {
            console.log('is NOT valide : ', 'rule : ', rule, 'value : ', value, 'res: ', res);
            return {
              message: res.message,
            };
          }
        }
      }
    }
    if (rule.file) {
      if (!(res = validations.file(value, rule.file)).isValide)
        return {
          message: res.message,
        };
    }
    return {
      value,
    };
  };