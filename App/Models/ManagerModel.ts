import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/CtrlManager";
import ManagerAccountModel from "./ManagerAccountModel";

const managerSchema = new Schema({

  manageraccount: {
    type: Schema.Types.ObjectId,
    ref: ManagerAccountModel.modelName,
    require: true,
  },
});

export const ManagerModel = mongoose.model("manager", managerSchema);

const maker = MakeModelCtlForm({
  model: ManagerModel,
  schema: managerSchema,
  volatile: true,
});

maker.pre("create", async ({ ctx }) => {
  ctx.data = {
    manageraccount: { ...ctx.data },
  };
});


export default ManagerModel;
