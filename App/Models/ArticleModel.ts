import mongoose, { Schema } from "mongoose";
import { MakeCtlForm } from "../../lib/squery/CtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import FolderModel from "./FolderModel";
import MagasinModel from "./Magasin";

let ArticleShema = SQuery.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
    access: 'public',
    minlength: [3, "trop court"],
    maxlength: [20, "trop long"],
  },

  stock: {
    type: Number,
    required: true,
    validate: [{
      validator: (value) => value > 0,
      msg: "be great than Zero"
    }]
  },
  folders:[ {
    type: Schema.Types.ObjectId,
    ref: FolderModel.modelName,
  }],
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, "trop court"],
    maxlength: [255, "trop long"],
  }
  ,
  views: [{
    type: String,
    file: {
      size: [1, 1_000_000],
      length: [0, 5],
      type: ['image/png'],
    },
    confirmList: true,
  }],
  magasins: [{
    type: Schema.Types.ObjectId,
    ref: MagasinModel.modelName,
    default: [],
  }],

  price: {
    type: Number,
    required: true
  }
});

const ArticlModel = mongoose.model('article', ArticleShema)

MakeCtlForm({
  schema: ArticleShema,
  model: ArticlModel,
  volatile: true

})

export default ArticlModel