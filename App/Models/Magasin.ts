import mongoose ,{ Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let MagasinShema = SQuery.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

});

const MagasinModel =  mongoose.model('magasin',MagasinShema)

 MakeCtlForm({
    schema : MagasinShema ,
    model : MagasinModel ,
    volatile : true
})

export default MagasinModel