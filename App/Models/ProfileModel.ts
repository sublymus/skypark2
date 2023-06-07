import mongoose from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import { Config } from "../../lib/squery/Config";
let profileSchema = SQuery.Schema({

  imgProfile: [{
    type: String,
    file: {
      size: [1, 100_000_000],
      length: [0, 4],
      dir: [Config.conf.rootDir,'tamp'],
    }
  }],

  banner: [{
    access:'private',
    type: String,
    file: {
      length: [0, 4],
    }
  }],

  message: {
    type: String,
    default:'this is my profile'
  },

});

const ProfileModel = mongoose.model("profile", profileSchema);

MakeModelCtlForm({
  schema: profileSchema,
  model: ProfileModel,
  volatile: false,
});
export default ProfileModel;
