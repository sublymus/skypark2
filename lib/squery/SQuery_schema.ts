import { FlatRecord, ResolveSchemaOptions, Schema, SchemaOptions } from "mongoose";
import { DescriptionSchema, SQueryMongooseSchema } from "./Initialize";
import mongoosePaginate from "mongoose-paginate-v2";
import mongoose_unique_validator from "mongoose-unique-validator";
import Log from "sublymus_logger";
import { SQuery } from './SQuery';
const defaultRules = {
  __parentModel : {
    type: String,
    access: "admin",
  },
  __key : {
    type: Schema.Types.ObjectId,
    access: "secret",
  },

  __permission : {
    type: String,
    access: "secret",
  },
  __signupId : {
    type: String,
    access: "secret",
  },

  __createdAt : {
    type: Number,
    access: "admin",
  },
  __updatedAt : {
    type: Number,
    access: "admin",
  },
  __updatedProperty : [
    {
      type: String,
      access: "secret",
    },//64438cae5f4ed54dc6cefa6f
  ],
  _id : {
    type: Schema.Types.ObjectId,
    access: 'public'
  },
  __parentList :[ {
    type: {
      modelPath:String,
      id:String
    },
    access: "admin",
  }],
} satisfies DescriptionSchema;
export const SQuery_Schema = <DES extends DescriptionSchema>(description: DES, options?: SchemaOptions<FlatRecord<any>, {}, {}, {}, {}> | ResolveSchemaOptions<{}>): SQueryMongooseSchema<DES & typeof defaultRules> => {
  const _description = {...description ,...defaultRules } as DES & typeof defaultRules
  
  for (const p in _description) {
    const rule = _description[p];

    if (Array.isArray(rule) && rule[0].type === SQuery.FileType) {
      if (!rule[0].file)
        rule[0].file = {};
    }

    if (Array.isArray(rule)) {
      if (rule[0].default) {

      }
      rule[0]._default = rule[0].default
      delete rule[0].default
      if (rule[0]._default) {
        Log('****', {
          rule,
          p,
        })
      }
    } else {
      if (rule.default) {
        rule._default = rule.default || rule._default;
        delete rule.default
      }
      if (rule._default) {
        Log('****', {
          rule,
          p,
        })
      }
    }

  }
  const schema = new Schema(_description as any, {
    ...options
  });

  schema.plugin(mongoosePaginate);
  schema.plugin(mongoose_unique_validator);

  schema.pre("save", async function () {
    this.__updatedAt = Date.now();
    this.__updatedProperty = (this.modifiedPaths() as string[]).filter((updatedProperty) => {
      const rule = _description[updatedProperty];
      return Array.isArray(rule) ? rule[0].access !== 'secret' : rule?.access !== 'secret';
    });
  });

  schema.post("save", async function (doc: any) {
    //Log('save+++++++', doc);
    // SQuery.emiter.when('update:' + doc._id.toString(), (val) => {
    //   Log('update:' + doc._id.toString(), val);
    // })
    let canEmit = false;
    doc.__updatedProperty.forEach((p: string) => {
      const rule = _description[p];
      if (p == '__updatedProperty' || p == '__updatedAt') {
        return;
      } else if (Array.isArray(rule) && rule[0]?.access != 'secret' && rule[0]?.emit != false) {
        canEmit = true;
      } else if (!Array.isArray(rule) && rule?.access != 'secret' && rule?.emit != false) {
        canEmit = true;
      }
      //console.log(p, canEmit);
    });
    //console.log(doc.__updatedProperty, canEmit);
    if (!canEmit) return;

    SQuery.IO?.emit("update:" + doc._id.toString(), {
      id: doc._id.toString(),
      doc,
      properties: doc.__updatedProperty,
    });
  });
  (schema as any).description = _description;
  return schema as SQueryMongooseSchema<DES & typeof defaultRules>;
};
