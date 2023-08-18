import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { CtrlManager } from "../../lib/squery/CtrlManager";
import { ControllerSchema, Controllers, ModelControllers, ModelFrom_optionSchema, ModelInstanceSchema, ResponseSchema } from "../../lib/squery/Initialize";
import PadiezdModel from "../Models/PadiezdModel";
import QuarterModel from "../Models/QuarterModel";
import BuildingModel from "../Models/BuildingModel";
import AccountModel from "../Models/AccountModel";
import { formatModelInstance } from "../../lib/squery/ModelCtrlManager";
const app: ControllerSchema = {
    buildingList: async (ctx: ContextSchema): ResponseSchema => {
        Log('padiezdList', ctx.data);
        const quarter = await QuarterModel.findOne({ _id: ctx.data.quarterId });
        Log('quarter', { quarter });
        if (!quarter) return

        const buildingList = await BuildingModel.find({
            _id: {
                $in: quarter.buildings.map((b: any) => b._id.toString()),
            }
        })

        Log('buildingList', { buildingList })

        return {
            response: buildingList,
            code: 'ok',
            message: 'ok',
            status: 200,
        }
    },
    padiezdList: async (ctx: ContextSchema): ResponseSchema => {
        Log('padiezdList', ctx.data);
        const quarter = await QuarterModel.findOne({ _id: ctx.data.quarterId });
        Log('quarter', { quarter });
        if (!quarter) return

        const filter = quarter.buildings.map((b: any) => {
            return 'building_' + b._id.toString() + "_padiezdList_padiezd"
        });
        Log('filter', { filter });
        const padiezdList = await PadiezdModel.find({
            __parentModel: {
                $in: filter
            }

        })

        Log('padiezdList', { padiezdList })

        return {
            response: padiezdList,
            code: 'ok',
            message: 'ok',
            status: 200,
        }
    },
    childList: async (ctx: ContextSchema): ResponseSchema => {
        //TODO*
        //on garde en memoire les (n)10 1er parent et pour les parent du dernier parent on intere l'operation
        Log('accountList', ctx.data);
        const { parentId, parentModelPath, childModelPath, pagging } = ctx.data as {
            parentId: string, parentModelPath: string, childModelPath: string, pagging: {
                page?: number,
                limit?: number,
                select?: string,
                sort?: any,
                query?: any
            }
        }
        if (!parentModelPath || !childModelPath) return;


        const defaultPaging = {
            page: 1,
            limit: 20,
            lean: false,
            sort: {
                "__createdAt": -1
            },
            select: "",
        };
        const myCustomLabels = {
            totalDocs: "totalItems",
            docs: "items",
        };

        const options: any = {
            page: pagging?.page || defaultPaging.page,
            limit: pagging?.limit || defaultPaging.limit,
            sort: pagging?.sort || defaultPaging.sort,
            select: pagging?.select || defaultPaging.select,
            lean: defaultPaging.lean,
            populate: false,
            customLabels: myCustomLabels,
        };

        let pagingData = null;
        const query = parentId ? { ...(pagging?.query || {}), "__parentList.modelPath": parentModelPath, "__parentList.id": parentId } : { ...(pagging?.query || {}), "__parentList.modelPath": parentModelPath };
        try {
            pagingData = await ModelControllers[childModelPath]?.option.model.paginate?.(
                query,
                options,
            );
            // Log('pagingData', pagingData)
            const promise = pagingData.items.map((item: any) => {
                return formatModelInstance({
                    ...ctx,
                    service: 'read',
                }, {
                    model: {
                        modelName: 'account'
                    }

                } as ModelFrom_optionSchema & { modelPath: string }, item);
            });
            await Promise.allSettled(promise);
        } catch (error: any) {
            Log("someError", error)
            return
        }
        if (!pagingData)  return

        return {
            response: pagingData,
            code: 'ok',
            message: 'ok',
            status: 200,
        }
    },
}

const maker = CtrlManager({
    ctrl: { app },
    access: {
        like: "any"
    }
});