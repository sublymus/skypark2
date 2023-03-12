import mongoose from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import { Config } from "../../squeryconfig";

let profileSchema = SQuery.Schema({

  imgProfile: [{
    type: String,
    access: 'private',
    file: {
      size: [1, 1_000_000],
      length: [0, 4],
      dir: Config.rootDir + '/tamp',
    }
  }],
  banner: [{
    type: String,
    file: {
      length: [0, 4],
    }
  }],
  message: {
    type: String
  },

});

const ProfileModel = mongoose.model("profile", profileSchema);

MakeModelCtlForm({
  schema: profileSchema,
  model: ProfileModel,
  volatile: false,
});
export default ProfileModel;
