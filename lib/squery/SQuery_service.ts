import { ContextSchema, DataSchema } from "./Context";
import { AllowedModelService, SQuery } from "./SQuery";

export const SQuery_service = (ctrlName:string, service:string, data:DataSchema, ctx?:ContextSchema):Promise<any> => {
    const _data = data || ctx?.data;
    
    return new Promise(async (rev)=>{
        await SQuery(ctx?.socket)(ctrlName,service)(_data,(res)=>{
            rev(res);
        });
    })
};
 