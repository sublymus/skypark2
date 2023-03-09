import mongoose, { Schema } from "mongoose";
import Log from "sublymus_logger";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import ManagerAccountModel from "./ManagerAccountModel";

const managerSchema = new Schema({

  manageraccount: {
    type: Schema.Types.ObjectId,
    ref: ManagerAccountModel.modelName,
    require: true,
    //populate: true,
  },
  expires_at: {
    type: Date,
    expires: 30, // exprime en secondes, ici 300s = 5min
    default: Date.now
  },
});

export const ManagerModel = mongoose.model("manager", managerSchema);

const maker = MakeCtlForm({
  model: ManagerModel,
  schema: managerSchema,
  volatile: true,
});

maker.pre("create", async ({ ctx }) => {
  ctx.data = {
    manageraccount: { ...ctx.data },
  };
});

// maker.post('create',
//   //  listener //  listener
//   ({ ctx, more, event }) => {
//     Log('post', 'manager pre', event, ctx.modelPath)
//   }
// )
export default ManagerModel;
