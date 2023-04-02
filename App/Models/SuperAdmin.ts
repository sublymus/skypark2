import mongoose from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let SuperAdminSchema = SQuery.Schema({

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
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    access: "private",
    get: (v: string) => v.length,
    set: (v: string) => v, // crypter
  },
  telephone: {
    type: String,
    required: true,
    access: 'private',
  },
});

const SuperAdminModel = mongoose.model("superadmin", SuperAdminSchema);

const ctrlMaker = MakeModelCtlForm({
  schema: SuperAdminSchema,
  model: SuperAdminModel,
  volatile: true,
});

ctrlMaker.pre('store', async ({ ctx }) => {
  //console.log('********************#################################*********', ctx.data);

  ctx.data = {
    ...ctx.data,
    profile: {
      /// imgProfile: ['/temp/1677915905612_6402f701d7944fff36120416.png'],
      // banner: ['/temp/1677915905612_6402f701d7944fff36120416.png'],
      message: "*** BEST ****",
    },
  }
})


export default SuperAdminModel;
