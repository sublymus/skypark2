import mongoose, { Model, Schema } from "mongoose";
//@ts-ignore
import mongoose_unique_validator from "mongoose-unique-validator";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
//import Aes from "ezcryption/dist/aes";

export interface IManagerAccount {
  // Propriétés de l'objet ManagerAccount
  codes: string;
  __key: any;
  __permission: String;
  name: String;
  email: String;
  password: String;
  phone: String;
  createdDate: Number;
  updatedDate: Number;
  expires_at: Date;
}

export interface IManagerAccountDocument extends IManagerAccount, Document {
  decryptCode(): Promise<string>;
}

export interface IManagerAccountModel extends Model<IManagerAccountDocument> {}

let managerAccountSchema = new Schema<
  IManagerAccountDocument,
  IManagerAccountModel
>(
  {
    __key: {
      type: Schema.Types.ObjectId,
      require: true,
      access: "secret",
    },
    __permission: {
      type: String,
      access: "secret",
    },
    name: {
      type: String,
      trim: true,
      minlength: [3, "trop court"],
      maxlength: [20, "trop long"],
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      access: "private",
      // get: (v: string) => v.length,
      // set: (v: string) => v, // crypter
    },
    phone: {
      type: String,
      required: true,
    },

    codes: {
      type: String,
    },

    expires_at: {
      type: Date,
      expires: 30,
      default: Date.now,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    updatedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    methods: {
      async decryptCode() {
       // return await Aes.decrypt(this.codes, "password");
      },
    },
  }



);

export const ManagerAccountModel = mongoose.model(
  "manageraccount",
  managerAccountSchema
);

let mkctrl = MakeCtlForm({
  schema: managerAccountSchema,
  model: ManagerAccountModel,
  volatile: false,
});

mkctrl.post('update' ,  async (ctx)=> {
//   if(!ctx.more.modelInstance)  return {...ctx}

// ctx.more.modelInstance.updatedDate = Date.now();
// await ctx.more.modelInstance.save()
return {...ctx}
} )
export default ManagerAccountModel;
