import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import ChannelModel from "./ChannelModel";
import Log from "sublymus_logger";

let buildingSchema = SQuery.Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      strictAlien: true,
      impact: false,
      removed:[{
        pattern: './account/address/building',
        map: (source , target) => {
          Log('soureceID', { source, target })
          return source
        }
      }],
      added:[{
        pattern: './account/address/building -> ./_id',
        map: (id, option) => {
          Log('soureceID', { id, option })
          return id
        }
      }]
    }, 
  ],
  Thread: {
    type: Schema.Types.ObjectId,
    ref: ChannelModel.modelName,
    alien: true,
  },
  // activities: [{
  //     type: Schema.Types.ObjectId,
  //     ref: ActivityModel.modelName,
  // }]
});

const BuildingModel = mongoose.model("building", buildingSchema);

const maker = MakeModelCtlForm({
    schema: buildingSchema,
    model: BuildingModel,
    volatile: true,
    bind:[
      {
        pattern:'wertyui',
        map:{
          toLeft(v) {
            
          },toRight(v) {
            
          },
        }
      }
    ]
});

export default BuildingModel;
