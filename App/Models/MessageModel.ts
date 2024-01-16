import mongoose, { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";

let MessageSchema = SQuery.Schema({
    account: {
        type: Schema.Types.ObjectId,
        ref: 'account',
        strictAlien: true,
        impact: false,
    },
    text: {
        type: String
    },
    files: [{
        type: SQuery.FileType,
        file: {
            length: 20,
        },
    }],
    targets: [{
        type: Schema.Types.ObjectId,
        ref: 'account',
        impact: false,
    }],
    status: {
        type: {
            send: Number,
            received: Number,
            seen: Number
        },
        default: {
            send: 0,
            received: 0,
            seen: 0
        }
    }
});

export const MessageController = new SQuery.ModelController({
    name:'message',
    schema: MessageSchema,
  });
  
  MessageController.pre('create', async ({ ctx }) => {
    if (ctx.__permission == 'admin') return;
    ctx.data.account = ctx.login.id;
});