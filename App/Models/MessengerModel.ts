import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ChannelModel from "./ChannelModel";
import DiscussionModel from "./DiscussionModel";

let MessengerSchema = SQuery.Schema({
  listDiscussion: [
    {
      type: Schema.Types.ObjectId,
      ref: DiscussionModel.modelName,
      access: "public",
    },
  ],
  archives: [
    {
      type: Schema.Types.ObjectId,
      ref: ChannelModel.modelName,
    },
  ],
});

const MessengerModel = mongoose.model("messenger", MessengerSchema);

MakeModelCtlForm({
  schema: MessengerSchema,
  model: MessengerModel,
  volatile: true,
});

export default MessengerModel;
