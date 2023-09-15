import Log from "sublymus_logger";
import {  ControllerInterface, ListenerPostSchema, ModelControllerInterface, MoreSchema, ResultSchema, Tools, ToolsInterface } from "../Initialize";
import { ContextSchema } from "../Context";
import { Local } from "../SQuery_init";
import { ModelController } from "../SQuery_ModelController";
import { Controller } from "../SQuery_controller";
type CTRL = ControllerInterface<any,any,any>
declare module "../Initialize" {
    export interface ToolsInterface {
        'assigneToNewListElement': (this:{controller:CTRL},data: assigneToNewListElementType) => void
    }
}

type assigneToNewListElementType = {
    parentModelPath: string;
    parentListProperty: string;
    targetProperty: string;
    targetExtractorPath: string
    sourceProperty?: string;
    sourceExtractorPath?: string
    map?: (value: any, option?: assigneToNewListElementType) => any
}
export const assigneToNewListElementData: { [k: string]: assigneToNewListElementType[] } = {}
const assigneToNewListElement = function (this: { controller: CTRL}, data: assigneToNewListElementType) {
    if (!assigneToNewListElementData[this.controller.name]) assigneToNewListElementData[this.controller.name] = []
    assigneToNewListElementData[this.controller.name].push(data);
    this.controller.post('list', assigneTonewElementFunc(data));
}

export const assigneTonewElementFunc = (data: assigneToNewListElementType): ListenerPostSchema => {
    const exc: ListenerPostSchema = async ({ res, ctx, more }: { res: ResultSchema, ctx: ContextSchema, more?: MoreSchema }) => {
        try {
            if (!res?.response?.added || res?.response?.added.length <= 0) return;
            const parentModel = ctx.data?.paging?.query?.__parentModel;
            const parts = parentModel.split('_');
            const parentId = parts[1];
            // Log('User_LIST', { parentId, parts })
            // setTimeout(() => {
            //     Log('des**', 'ERROR_User_LIST_ADD_BUILDING_ID', {  parentId, parts });
            // }, 2000); 
            if (parts[0] != data.parentModelPath || parts[2] != data.parentListProperty) return;

            const resExtractor = await Local.Controllers['server'].services['extractor']({
                ...ctx,
                data: {
                    modelPath: data.parentModelPath,
                    id: parentId,
                    extractorPath: data.sourceExtractorPath
                }
            })
            // Log('User_LIST', { resExtractor })
            // setTimeout(() => {
            //     Log('des**', 'ERROR_User_LIST_ADD_BUILDING_ID', { resExtractor });
            // }, 2000); 
            if (!resExtractor?.response) return;
            const sourcRes = await Local.ModelControllers[resExtractor.response.modelPath]?.services.read({
                ...ctx,
                data: { id: resExtractor.response.id }
            });
            const sourceInstance = sourcRes?.response;
            // Log('User_LIST', { sourceInstance })
            if (!sourceInstance) return;
            // setTimeout(() => {
            //     Log('des**', 'ERROR_User_LIST_ADD_BUILDING_ID', { sourceInstance });
            // }, 2000); 
            /******************************** assigne  to each new element */
            Log('addes', res.response)
            for (const key in res.response.added) {
                try {
                    if (Object.prototype.hasOwnProperty.call(res.response.added, key)) {
                        const userId = res.response.added[key];
                        const resExtractor = await Local.Controllers['server'].services['extractor']({
                            ...ctx,
                            data: {
                                modelPath: 'user',
                                id: userId,
                                extractorPath: data.targetExtractorPath
                            }
                        })
                        //Log('User_LIST_foreach', { resExtractor })
                        if (!resExtractor?.response) return
                        const targetInstance = await Local.ModelControllers[resExtractor.response.modelPath]?.model.findOne({ _id: resExtractor.response.id });
                        //Log('User_LIST_foreach', { targetInstance })
                        if (!targetInstance) return;
                        targetInstance[data.targetProperty] = data.map ? data.map(sourceInstance[data.sourceProperty || ''], data) : sourceInstance[data.sourceProperty || ''];
                        await targetInstance.save();
                        setTimeout(() => {
                            Log('des**', 'targetInstance', { targetInstance });
                        }, 2000); 
                    }
                } catch (error) {
                    continue
                }
            }
        } catch (error) {
            setTimeout(() => {
                Log('des**', 'ERROR_User_LIST_ADD_BUILDING_ID', { error });
            }, 2000);
        }
    }
    return exc;
}

Tools.assigneToNewListElement = assigneToNewListElement;
