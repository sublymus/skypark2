import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { ResponseSchema } from "../../lib/squery/Initialize";
import { PadiezController } from "../Models/PadiezdModel";
import {QuarterController} from "../Models/QuarterModel";
import { BuildingController } from "../Models/BuildingModel";
import { formatModelInstance } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import { EXIST_BREAKER, RESPONSE_BREAKER } from "../Tools/Breaker";
import { Local } from "../../lib/squery/SQuery_init";

export const AppController = new SQuery.Controller({
    name: 'app',
    services: {
        buildingList: async (ctx): ResponseSchema => {
            Log('padiezdList', ctx.data);
            const quarter = await QuarterController.model.findOne({ _id: ctx.data.quarterId });
            Log('quarter', { quarter });
            if (!EXIST_BREAKER(ctx, quarter, `for quarterId=${ctx.data.quarterId}, quarter don't exist`)) return

            const buildingList = await BuildingController.model.find({
                _id: {
                    $in: quarter.buildings?.map((b: any) => b._id.toString()),
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
            const quarter = await QuarterController.model.findOne({ _id: ctx.data.quarterId });
            Log('quarter', { quarter });
            if (!quarter) return

            const filter = quarter.buildings?.map((b: any) => {
                return 'building_' + b._id.toString() + "_padiezdList_padiezd"
            });
            Log('filter', { filter });
            const padiezdList = await PadiezController.model.find({
                __parentModel: {
                    $in: filter
                }

            })

            Log('padiezdList', { padiezdList })

            RESPONSE_BREAKER(ctx, padiezdList)
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
                pagingData = await Local.ModelControllers[childModelPath]?.model.paginate?.(
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

                    }, item);
                });
                await Promise.allSettled(promise);
            } catch (error: any) {
                Log("someError", error)
                return
            }

        return{
            code:'ok',
            message:'ok',
            status:200,
            response:pagingData
        };
    },
    // servicesDescription: {
    //     buildingList: {
    //         data: 0,
    //         result: {}
    //     }
    }
});

console.log('@@@@@@@@', AppController);


AppController.servicesDescription?.buildingList.data