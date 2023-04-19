import mongoose, { Schema } from "mongoose";
import Log from "sublymus_logger";
import { Controllers, ModelControllers } from "../../lib/squery/Initialize";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AccountModel from "./AccountModel";
import MessengerModel from "./MessengerModel";

let userSchema = SQuery.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    //  required: true,
  },
  messenger: {
    type: Schema.Types.ObjectId,
    ref: MessengerModel.modelName,
    access: 'private'
  }
});

const UserModel = mongoose.model("user", userSchema);

const maker = MakeModelCtlForm({
  model: UserModel,
  schema: userSchema,
  volatile: true,
})
type assigneToNewListElementSchema = {
  parentModelPath: string;
  parentListProperty: string;
  targetProperty: string;
  targetExtractorPath: string
  sourceProperty?: string;
  sourceExtractorPath?: string
  map?: (value: any, option?: assigneToNewListElementSchema) => any
}
const assigneToNewListElement = (data: assigneToNewListElementSchema) => {
  return async ({ res, ctx }) => {

    try {
      if (!res?.response?.added || res?.response?.added.length <= 0) return;
      const parentModel = ctx.data?.paging?.query?.__parentModel;
      const parts = parentModel.split('_');
      const parentId = parts[1];
      Log('User_LIST', { parentId, parts })
      if (parts[0] != data.parentModelPath || parts[2] != data.parentListProperty) return;

      const resExtractor = await Controllers['server']()['extractor']({
        ...ctx,
        data: {
          modelPath: data.parentModelPath,
          id: parentId,
          extractorPath: data.sourceExtractorPath
        }
      })
      Log('User_LIST', { resExtractor })
      if (resExtractor.error) return;
      const sourcRes = await ModelControllers[resExtractor.response.modelPath]()['read']({
        ...ctx,
        data: { id: resExtractor.response.id }
      });
      const sourceInstance = sourcRes.response;
      Log('User_LIST', { sourceInstance })
      if (!sourceInstance) return;

      /******************************** assigne  to each new element */
      Log('addes', res.response)
      for (const key in res.response.added) {
        try {
          if (Object.prototype.hasOwnProperty.call(res.response.added, key)) {
            const userId = res.response.added[key];
            const resExtractor = await Controllers['server']()['extractor']({
              ...ctx,
              data: {
                modelPath: 'user',
                id: userId,
                extractorPath: data.targetExtractorPath
              }
            })
            //Log('User_LIST_foreach', { resExtractor })
            if (resExtractor.error) return
            const targetInstance = await ModelControllers[resExtractor.response.modelPath].option.model.findOne({ _id: resExtractor.response.id });
            //Log('User_LIST_foreach', { targetInstance })
            if (!targetInstance) return;
            targetInstance[data.targetProperty] = data.map ? data.map(sourceInstance[data.sourceProperty], data) : sourceInstance[data.sourceProperty];
            await targetInstance.save();
          }
        } catch (error) {
          continue
        }
      }
    } catch (error) {
      Log('ERROR_User_LIST_ADD_BUILDING_ID', { error })
    }
  }
}
maker.post('list', assigneToNewListElement({
  parentModelPath: 'building',
  parentListProperty: 'users',
  targetExtractorPath: './account/address',
  targetProperty: 'city',
  sourceExtractorPath: './',

  sourceProperty: 'name',
  map: (id, option) => {
    Log('soureceID', { id, option })
    return option.sourceProperty + ' is = ' + id
  }
}))
export default UserModel;
