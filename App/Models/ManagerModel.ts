import mongoose, { Schema } from "mongoose";
import Log from "sublymus_logger";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import AccountModel from "./AccountModel";

const managerSchema = new Schema({
  __key: {
    type: Schema.Types.ObjectId,
    require: true,
    access: 'secret'
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    require: true,
    //populate: true,
  },
});


const ManagerModel = mongoose.model("manager", managerSchema);

const maker = MakeCtlForm({
  model: ManagerModel,
  modelPath: 'manager',
  schema: managerSchema,
  volatile: true,
})


maker.pre('create', ({ ctx }) => {
  ctx.__key = 'random Key+mager'
})

maker.post('create',
  //  listener //  listener
  ({ ctx, more, event }) => {
    Log('post', 'manager pre', event, ctx.modelPath)
  }
)
export default ManagerModel;



