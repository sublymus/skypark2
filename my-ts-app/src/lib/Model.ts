import { createInstanceFrom } from "./Instance";
import createSQueryFrom, { DescriptionSchema } from "./SQueryClient";

const ModelCache : any = {}; 

export async function createModelFrom(modelPath: string, description: DescriptionSchema, SQuery: any): Promise<any> {
  
  if(ModelCache[modelPath]) return ModelCache[modelPath];
  
  const Model: any = {};
  Model.description = description;
  Model.create = async (data: any, errorCb: any): Promise<any> => {
  ///// verifier si chaque donner est bien rentrer

    if (!errorCb) errorCb = (e: any) => console.error(e);
   
    return await new Promise((rev) => {
      try {
        SQuery.emit(modelPath + ":create", data, async (res: any) => {
          try {
            if (res.error) {
              errorCb(res);
              return rev(null);
            }
            rev(await createInstanceFrom({ modelPath, id: res.response, SQuery }));
          } catch (e) {
            errorCb(e);
            return rev(null);
          }
        });
      } catch (e) {
        errorCb(e);
        return rev(null);
      }
    });
  };
  /** ****************      Instance      ******************* */
  Model.newInstance = async (
    data: { id: string } |{ cache: { _id: string , __parentModel:string,  __createdAt: number, __updatedAt: number}},
    errorCb: any
  ): Promise<any> => {
    if (!errorCb) errorCb = (e: any) => console.error(e);
    let instance = null;
    try {
        if ((data as any).id) {
            instance = await createInstanceFrom({ modelPath, id: (data as any).id, SQuery }); 
          }
        else if ((data as any).cache?._id){
          instance = await createInstanceFrom({ modelPath, _cache:(data as any).cache, SQuery });
        }
        else{
        
        }
    
    } catch (e) {
      errorCb(e);
    }
    return instance;
  };

  Model.update = async (data: any): Promise<any> => {

    return await new Promise((rev, rej) => {
      try {
        SQuery.emit(modelPath + ":update", data, (res: any) => {
          try {
            if (res.error) {
              console.log(`ERROR de mise a jour du modelPath:${modelPath} , id:${data.id}`, JSON.stringify(res));
              return rev(null);
            }
            ////*console.log('*************', { modelPath, id: res.response, description });
            rev(createInstanceFrom({ modelPath, id: res.response , SQuery }));
            //restCarte.text.value = JSON.stringify(res);
          } catch (e) {
            console.log(`ERROR creation d'instance du modelPath:${modelPath} , id:${data.id}`, JSON.stringify(e));
            rev(null);
          }
        });
      } catch (e) {
        console.log(`ERROR de mise a jour du modelPath:${modelPath} , id:${data.id}`, JSON.stringify(e));
        rev(null);
      }
    });
  };
  Model.delete = async (data: {id:string}): Promise<any> => {

    return await new Promise((rev, rej) => {
      try {
        SQuery.emit(modelPath + ":delete", data, (res: any) => {
          if (res.error) {
            console.log(`ERROR de delete du modelPath:${modelPath} , id:${data.id}`, JSON.stringify(res));
            return rev(null);
          }
        });
      } catch (e) {
        console.log(`ERROR de delete du modelPath:${modelPath} , id:${data.id}`, JSON.stringify(e));
        rev(null);
      }
    });
  };
  ModelCache[modelPath] = Model;
  return Model;
}
