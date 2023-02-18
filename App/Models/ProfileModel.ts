import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { Config } from "../../squeryconfig";

let profileSchema = new Schema({
  __key: {
    type: Schema.Types.ObjectId,
    require: true,
    access: 'secret'
  },
  imgProfile: [{
    type: String,
    //required: true,
    file: {
      size: [1, 1_000_000],
      length: [0, 4],
      type: [],
      dir: Config.__dirname + '/tamp',
    }
  }],
  banner: [{
    type: String,
    file: {
      length: [0, 4],
    }
  }],
  message: String,
  updatedDate: Number

});

const ProfileModel = mongoose.model("profile", profileSchema);

MakeCtlForm({
  schema: profileSchema,
  model: ProfileModel,
  modelPath: 'profile',
  volatile: false,
});
export default ProfileModel;
