import mongoose, { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {MessageController} from "./MessageModel";

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
    default:false
  },
  channel: [{
    type: Schema.Types.ObjectId,
    ref:MessageController.name,
    access: 'public',
    impact: true,
    required:true
  }],
});

export const DiscussionController = new SQuery.ModelController({
  name:'discussion',
  schema: DiscussionSchema,
});
