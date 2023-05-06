import { Schema } from "mongoose";
import { DescriptionSchema, SQueryMongooseSchema } from "./Initialize";
import { Global, SQuery } from "./SQuery";
import mongoosePaginate from "mongoose-paginate-v2";
import mongoose_unique_validator from "mongoose-unique-validator";

export const SQuery_Schema = (description: DescriptionSchema): SQueryMongooseSchema => {
    description.__parentModel = {
      type: String,
      access: "admin",
    };
    description.__key = {
      type: Schema.Types.ObjectId,
      access: "secret",
    };
  
    description.__permission = {
      type: String,
      access: "secret",
    };
    description.__signupId = {
      type: String,
      access: "secret",
    };
  
    description.__createdAt = {
      type: Number,
      access: "admin",
    };
    description.__updatedAt = {
      type: Number,
      access: "admin",
    };
    description.__updatedProperty = [
      {
        type: String,
        access: "secret",
      },//64438cae5f4ed54dc6cefa6f
    ];
    description._id = {
      type: Schema.Types.ObjectId,
      access: 'public'
    };
    const schema = new Schema(description as any);
    schema.plugin(mongoosePaginate);
    schema.plugin(mongoose_unique_validator);
  
    schema.pre("save", async function () {
      this.__updatedAt = Date.now();
      this.__updatedProperty = this.modifiedPaths();
    });
  
    schema.post("save", async function (doc: any) {
      //Log('save+++++++', doc.__parentModel,);
      // SQuery.emiter.when('update:' + doc._id.toString(), (val) => {
      //   Log('update:' + doc._id.toString(), val);
      // })
      let canEmit = false;
      doc.__updatedProperty.forEach((p: string) => {
        const rule = description[p];
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
  
      Global.io.emit("update:" + doc._id.toString(), {
        id: doc._id.toString(),
        doc,
        properties: doc.__updatedProperty,
      });
    });
    (schema as any).description = description;
    return schema as SQueryMongooseSchema;
  };
  

  