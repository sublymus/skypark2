import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {DiscussionController} from "./DiscussionModel";

let MessengerSchema = SQuery.Schema({
  listDiscussion: [
    {
      type: Schema.Types.ObjectId,
      ref: DiscussionController.name,
      alien: true,
    },
  ],
  archives:  [{
    type: Schema.Types.ObjectId,
    ref: DiscussionController.name,
    alien: true,
  }],
});

export const MessengerController = new SQuery.ModelController({
  name:'messenger',
  schema: MessengerSchema,
});
