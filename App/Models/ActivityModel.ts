import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {ProfileController} from "./ProfileModel";

let ActivitySchema = SQuery.Schema({
  poster: {
    type: Schema.Types.ObjectId,
    ref: ProfileController.name,
    required: true,
  },
  channel: [{
    type: Schema.Types.ObjectId,
    ref: 'post',
    access: 'public',
    impact: true,
  }],
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  icons: [{
    type: SQuery.FileType,
    // required: true,
    file: {
      size: 800_000,
      type: ['image/png']
    }
  }]
});

export const ActivityController = new SQuery.ModelController({
  name:'activity',
  schema: ActivitySchema,
});
