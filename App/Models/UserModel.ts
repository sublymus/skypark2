import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {MessengerController} from "./MessengerModel";

let userSchema = SQuery.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: true,
  },
  messenger: { 
    type: Schema.Types.ObjectId,
    ref: MessengerController.name,
    access: 'private',
    default:{
      listDiscussion: [],
      archives:  [],
    }
  },
  entreprise: {
    type: Schema.Types.ObjectId,
    ref: 'entreprise',
    strictAlien:true
  }
});

 export const UserController = new SQuery.ModelController({
  name:'user',
  schema: userSchema
});

// UserController.tools.assigneToNewListElement({
//   parentModelPath: 'padiezd',
//   parentListProperty: 'users',
//   targetExtractorPath: './account/address',
//   targetProperty: 'padiezd',
//   sourceExtractorPath: './',//padiezd
//   sourceProperty: '_id',
//   map: (id, option) => {
//     Log('soureceID', { id, option })
//     return id
//   }
// });
// UserController.tools.assigneToNewListElement({
//   parentModelPath: 'padiezd',
//   parentListProperty: 'users',
//   targetExtractorPath: './account/address',
//   targetProperty: 'building',
//   sourceExtractorPath: '../',//building
//   sourceProperty: '_id',
//   map: (id, option) => {
//     Log('soureceID', { id, option })
//     return id
//   }
// });

// UserController.tools.assigneToNewListElement({
//   parentModelPath: 'padiezd',
//   parentListProperty: 'users',
//   targetExtractorPath: './account/address',
//   targetProperty: 'quarter',
//   sourceExtractorPath: '../../',//quarter
//   sourceProperty: '_id',
//   map: (id, option) => {
//     Log('soureceID', { id, option })
//     return id
//   }
// });

// UserController.tools.assigneToNewListElement({
//   parentModelPath: 'padiezd',
//   parentListProperty: 'users',
//   targetExtractorPath: './',
//   targetProperty: 'entreprise',
//   sourceExtractorPath: '../../../',//entreprise
//   sourceProperty: '_id',
//   map: (id, option) => {
//     Log('soureceID', { id, option })
//     return id
//   }
// });
