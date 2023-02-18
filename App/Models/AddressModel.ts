import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";

let addressSchema = new Schema({
  __key: {
    type: Schema.Types.ObjectId,
    require: true,
    access: 'secret'
  },
  location: {
    type: String,
    trim: true,
    required: true,
  },
  home: {
    type: String,
    required: true,
  },
  description: String,
  updatedDate: Number
});


const AddressModel = mongoose.model("address", addressSchema);

MakeCtlForm({
  schema: addressSchema,
  model: AddressModel,
  modelPath: 'address',
  volatile:false,
});
export default AddressModel;
