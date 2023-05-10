import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import { ModelControllers } from "../../lib/squery/Initialize";


let folderSchema = SQuery.Schema({

  refIds: [{
    type: Schema.Types.ObjectId,// __parentModel: 'user_64438c3a5f4ed54dc6cef9e7_account_account'
    alien: true,
    ref: 'refid',
  }],
  folderName: {
    type: String,
    required: true,
    emit: false
  },

});

const FolderModel = mongoose.model("folder", folderSchema);

MakeModelCtlForm({
  schema: folderSchema,
  model: FolderModel,
  volatile: true,
}).pre('delete', async ({ ctx }) => {
  const resR = await ModelControllers['refid']()['read']({
    ...ctx,
    data: {
      modelPath: 'post',
      id: '34568fd56a7cf8e54a5',
    }
  });
  const resU = await ModelControllers['refid']()['update']({
    ...ctx,
    data: {
      modelPath: 'post',
      id: '34568fd56a7cf8e54a5',
      data:{
        likeCount: 345
      }
    }
  });
  const resL= await ModelControllers['refid']()['list']({
    ...ctx,
    data: {
      modelPath: 'post',
      data:{
        addNew:[],
        addId:[],
        remove:[],
        paging:{}
      }
    }
  });
  const resD = await ModelControllers['refid']()['delete']({
    ...ctx,
    data: {
      modelPath: 'post',
      id: '34568fd56a7cf8e54a5',
    }
  });
  const resC = await ModelControllers['refid']()['create']({
    ...ctx,
    data: {
      modelPath: 'post',
      data:{
        message: {
          text: "Hello Its my",
          file: []
        },
        likeCount: 2098
      }
    }
  });
});
export default FolderModel;
