import mongoose, { Schema } from "mongoose";
import Log from "sublymus_logger";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import MessageModel from "./MessageModel";

let DiscussionSchema = SQuery.Schema({
  
  members: [{
    type: Schema.Types.ObjectId,
    ref:'account',
    strictAlien: true,
   // alien:true,
    impact: false,
    required:true,
  }],
  account1:{
    type: Schema.Types.ObjectId,
    ref:'account',
    strictAlien: true,
    impact: false,
  },
  account2:{
    type: Schema.Types.ObjectId,
    ref:'account',
    strictAlien: true,
    impact: false,
  },
  
  isGroup:{
    type:Boolean,
    required: true,
  },
  channel: [{
    type: Schema.Types.ObjectId,
    ref:MessageModel.modelName,
    access: 'public',
    impact: true,
    required:true
  }],
});

const DiscussionModel = mongoose.model("discussion", DiscussionSchema);

const maker = MakeModelCtlForm({
  schema: DiscussionSchema,
  model: DiscussionModel,
  volatile:true
});

maker.pre("create", async ({ ctx }) => {
});
export default DiscussionModel;
