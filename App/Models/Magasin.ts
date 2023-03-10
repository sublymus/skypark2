import mongoose from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let MagasinShema = SQuery.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

});

const MagasinModel = mongoose.model('magasin', MagasinShema)

MakeModelCtlForm({
  schema: MagasinShema,
  model: MagasinModel,
  volatile: true
})

export default MagasinModel