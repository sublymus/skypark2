import mongoose, { Schema } from "mongoose";
import Log from "sublymus_logger";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AccountModel from "./AccountModel";
import ChannelModel from "./ChannelModel";
import MessageModel from "./MessageModel";

let DiscussionSchema = SQuery.Schema({
  receiver: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    strictAlien: true,
    impact: false,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    strictAlien: true,
    impact: false,
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: ChannelModel.modelName,
    difine:['./channel/vectors',{
      type:Schema.Types.ObjectId,
      ref:MessageModel.modelName,
    }],
    access: 'admin',
    strictAlien: true,
    impact: false,
  },
});

const DiscussionModel = mongoose.model("discussion", DiscussionSchema);

const maker = MakeModelCtlForm({
  schema: DiscussionSchema,
  model: DiscussionModel,
  volatile: true,
});

maker.pre("create", async ({ ctx }) => {
});
export default DiscussionModel;
