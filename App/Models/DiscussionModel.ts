import mongoose, { Schema } from "mongoose";
import Log from "sublymus_logger";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AccountModel from "./AccountModel";
import ChannelModel from "./ChannelModel";

let DiscussionSchema = SQuery.Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    strictAlien: true,
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    strictAlien: true,
    required: true,
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: ChannelModel.modelName,
    required: true,
    alien: true,
  },
});

const DiscussionModel = mongoose.model("discussion", DiscussionSchema);

const maker = MakeModelCtlForm({
  schema: DiscussionSchema,
  model: DiscussionModel,
  volatile: true,
});

maker.pre("create", async ({ ctx }) => {
  Log("piou", ctx.data);
});
export default DiscussionModel;
