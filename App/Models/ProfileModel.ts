import { SQuery } from "../../lib/squery/SQuery";

let profileSchema = SQuery.Schema({

  imgProfile: [{
    type: SQuery.FileType,
    file: {
      size: [1, 100_000_000],
      length: [0, 4]
    }
  }],

  banner: [{
    type: SQuery.FileType,
    file: {
      length: [0, 4],
    }
  }],

  message: {
    type: String,
    default:'this is my profile'
  },

});

export const ProfileController = new SQuery.ModelController({
  name:'profile',
  schema: profileSchema
});
