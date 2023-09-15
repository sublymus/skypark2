import { SQuery } from "../../lib/squery/SQuery";

let LabelSchema = SQuery.Schema({
    label:{
        type:String
    },
    votes:{
        type:Number,
        default:0
    },
    clients:[{
        type:String,
    }]
});

export const LabelController = new SQuery.ModelController({
  name:'label',
  schema: LabelSchema,
});
