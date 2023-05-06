import { createInstanceFrom } from "./Instance.js";
import SQuery from "./SQueryClient.js";
import { Validator } from "./Validation.js";

export async function createModelFrom(modelPath) {
    const Model = {}
    const description = await SQuery.getDescription(modelPath);
    Model.description = description;
    Model.create = async (data, errorCb) => {    ///// verifier si chaque donner est bien rentrer

        if (!errorCb) errorCb = (e) => console.error(e);
        //NEW_ADD
        const validation = await Validator(description, data);
        if (validation.message) {
            // console.error(validation);
            errorCb({
                properties: validation,
            });
            return null
        };
        return await new Promise((rev) => {
            try {
                SQuery.emit(modelPath + ':create', data,
                    async (res) => {
                        try {
                            if (res.error) {
                                errorCb(res);
                                return rev(null);
                            }
                            rev(await createInstanceFrom({ modelPath, id: res.response }))
                        } catch (e) {
                            errorCb(e);
                            return rev(null);
                        }
                    }
                );
            } catch (e) {
                errorCb(e);
                return rev(null);
            }
        })
    };
    /** ****************      Instance      ******************* */
    Model.newInstance = async (data, errorCb) => {
        if (!errorCb) errorCb = (e) => console.error(e);
        let instance = null
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

    Model.newParentInstance = async ({ childInstance, childId }, errorCb) => {
        if (!errorCb) errorCb = (e) => console.error(e);
        let parentInstance = null
        let parentModelPath;
        let parentId;
        if (!childInstance) {
            childInstance = await createInstanceFrom({ modelPath, id: childId, Model });
        }
        try {
            try {
                parentId = await childInstance['$parentId'];
                parentModelPath = await childInstance['$parentModelPath']
                const parentModel = await SQuery.model(parentModelPath);
                parentInstance = parentModel.newInstance({ id: parentId });
            } catch (e) {
                errorCb(e);
            }
        } catch (e) {
            errorCb(e);
        }

        return parentInstance;
    };
    Model.update = async (data) => {
        const result = await Validator(description, data);
        if (result.value == undefined) {
            await emitRefresh([property])
            throw new Error('Invalide Value :' + value + ' \n because : ' + result.message);
        }
        return await new Promise((rev, rej) => {
            try {
                SQuery.emit(modelPath + ':update', data,
                    (res) => {
                        try {
                            if (res.error) {
                                console.error(res);
                                return rev(null);
                            }
                            ////*console.log('*************', { modelPath, id: res.response, description });
                            rev(createInstanceFrom({ modelPath, id: res.response, Model }))
                            //restCarte.text.value = JSON.stringify(res);
                        } catch (e) {
                            console.error(res);
                            rev(null)
                            //restCarte.text.value = JSON.stringify(e);
                        }
                    }
                );
            } catch (e) {
                rev(null)
                console.error(e);
                //restCarte.text.value = e;
            }
        })
    }
    return Model;
}