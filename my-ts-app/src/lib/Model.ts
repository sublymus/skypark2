import { createInstanceFrom } from "./Instance";
import SQuery from "./SQueryClient";
import { Validator } from "./Validation";
import { listenerSchema } from "./event/eventEmiter";

type Instance = {
  $modelPath: string;
  $id: string;
  $parentProperty: string;
  $parentId: string;
  $parentModelPath: string;
  $cache: { [Pr: string]: any };
  newParentInstance: () => Promise<Instance | null>;
  extractor: (extractorPath: string) => Promise<Instance | null>;
  update: (data: { id: string; [property: string]: any }) => Promise<void>;
  when: (
    event: string,
    listener: listenerSchema,
    changeRequired?: boolean
  ) => void;
  [p: string]: any;
};
type ArrayInstance = {
  back: any;
  next: any;
  page: any;
  $itemModelPath: any;
  last: any;
  update: any;
  when: any;
};
type ModelSchema = {
  description: { [str: string]: any };
  create: (value: { [str: string]: any }) => Promise<Instance | null>;
  newInstance: (value: { id: string }) => Promise<Instance | null>;
  newParentInstance: (data: {
    childInstance: Instance;
  }) => Promise<Instance | null>;
  update: (value: { id: string; [str: string]: any }) => Promise<any>;
};
export async function createModelFrom(modelPath: string): Promise<ModelSchema> {
  const Model: any = {};
  const description: any = await SQuery.getDescription(modelPath);
  Model.description = description;
  Model.create = async (data: any, errorCb: any): Promise<Instance | null> => {
    ///// verifier si chaque donner est bien rentrer

    if (!errorCb) errorCb = (e: any) => console.error(e);
    //NEW_ADD
    const validation = await Validator(description, data);
    if (validation.message) {
      // console.error(validation);
      errorCb({
        properties: validation,
      });
      return null;
    }
    return await new Promise((rev) => {
      try {
        SQuery.emit(modelPath + ":create", data, async (res: any) => {
          try {
            if (res.error) {
              errorCb(res);
              return rev(null);
            }
            rev(await createInstanceFrom({ modelPath, id: res.response }));
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
    data: any,
    errorCb: any
  ): Promise<Instance | null> => {
    if (!errorCb) errorCb = (e: any) => console.error(e);
    let instance = null;
    try {
      try {
        // //console.log('*************', { modelPath, id: data.id, description });
        instance = await createInstanceFrom({ modelPath, id: data.id, Model });
      } catch (e) {
        errorCb(e);
      }
    } catch (e) {
      errorCb(e);
    }
    return instance;
  };

  Model.newParentInstance = async (
    { childInstance, childId }: any,
    errorCb: any
  ) => {
    if (!errorCb) errorCb = (e: any) => console.error(e);
    let parentInstance = null;
    let parentModelPath;
    let parentId;
    if (!childInstance) {
      childInstance = await createInstanceFrom({
        modelPath,
        id: childId,
        Model,
      });
    }
    try {
      try {
        parentId = await childInstance["$parentId"];
        parentModelPath = await childInstance["$parentModelPath"];
        const parentModel = await SQuery.model(parentModelPath);
        parentInstance = await parentModel.newInstance({ id: parentId });
      } catch (e) {
        errorCb(e);
      }
    } catch (e) {
      errorCb(e);
    }

    return parentInstance;
  };
  Model.update = async (data: any): Promise<any> => {
    const result = await Validator(description, data);
    if (result.value == undefined) {
      // await emitRefresh([property])
      throw new Error("Invalide Value because : " + result.message);
    }
    return await new Promise((rev, rej) => {
      try {
        SQuery.emit(modelPath + ":update", data, (res: any) => {
          try {
            if (res.error) {
              console.error(res);
              return rev(null);
            }
            ////*console.log('*************', { modelPath, id: res.response, description });
            rev(createInstanceFrom({ modelPath, id: res.response, Model }));
            //restCarte.text.value = JSON.stringify(res);
          } catch (e) {
            console.error(res);
            rev(null);
            //restCarte.text.value = JSON.stringify(e);
          }
        });
      } catch (e) {
        rev(null);
        console.error(e);
        //restCarte.text.value = e;
      }
    });
  };
  return Model;
}
