import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import Log from "sublymus_logger";
 
let HistoriqueSchema = SQuery.Schema({
  elements:[{
    type:{
      id:String,
      modelName:String,
      mode:String,
      value:String,
      data:Schema.Types.Mixed
    }
  }]
});

export const HistoriqueController = new SQuery.ModelController({
  name:'historique',
  schema: HistoriqueSchema,
});



