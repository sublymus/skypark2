import { SQuery } from "../../lib/squery/SQuery";

let folderSchema = SQuery.Schema({

  refIds: [{
    type:{
      modelPath:String,
      id:String
    },
  }],
  folderName: {
    type: String,
    required: true,
  },

});

export const FolderController = new SQuery.ModelController({
  name:'folder',
  schema: folderSchema,
});
