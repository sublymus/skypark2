import { Local } from './SQuery_init';
import Log from "sublymus_logger";
import { accessValidator } from "./AccessManager";
import { ContextSchema } from "./Context";
import STATUS from "./Errors/STATUS";
import { DescriptionSchema, EventPostSchema, EventPreSchema, ModelControllerSchema, ModelInstanceSchema, MoreSchema, ResponseSchema, ResultSchema } from "./Initialize";
import { backDestroy, formatModelInstance } from "./ModelCtrlManager";
import { SQuery } from "./SQuery";
import { ModelController } from './SQuery_ModelController';

export const listFactory = (
  controller: ModelController,
  callPost: (e: EventPostSchema) => ResponseSchema,
  callPre: (e: EventPreSchema) => Promise<void | ResultSchema>
) => {
  return async (ctx: ContextSchema, more?: MoreSchema): ResponseSchema => {
    const service = "list";
    ctx = { ...ctx };
    ctx.service = service;
    ctx.ctrlName = controller.name;
    // if (!accessValidator({
    //   ctx,
    //   rule: option,
    //   type: "controller"
    // })) {
    //   return await callPost({
    //     ctx,
    //     more,
    //     res: {
    //       error: "BAD_AUTH_CONTROLLER",
    //       ...(await STATUS.BAD_AUTH(ctx, {
    //         target: controller.name.toLocaleUpperCase(),
    //       })),
    //     },
    //   });
    // }
    let { paging, addNew, addId, remove } = ctx.data;
    let parentModelInstance: ModelInstanceSchema | null | undefined;
    more = {
      ...more,
      savedlist: [],
      __parentModel: paging?.query?.__parentModel,
      modelPath: controller.name,

    };
    //console.log('***more', { more });

    const preRes = await callPre({
      ctx,
      more,
    });
    if (preRes) return preRes


    paging = paging || {};
    //   Log('remove', { remove })
    const parts = more.__parentModel?.split("_");
    const parentModelPath = parts?.[0] || '';
    const parentId = parts?.[1] || '';
    const parentProperty = parts?.[2] || '';
    let added: string[] = [];
    let removed: string[] = [];
    //Log("__parentModel", parts);

    const parentDescription: DescriptionSchema | undefined = Local.ModelControllers[parentModelPath]?.model.schema.description;
    let parentPropertyRule = parentDescription?.[parentProperty];
    if (Array.isArray(parentPropertyRule)) {
      parentPropertyRule = parentPropertyRule?.[0];
    } else {
      parentPropertyRule = parentPropertyRule;
    }

    try {
      parentModelInstance = await Local.ModelControllers[
        parentModelPath
      ]?.model.findOne({
        _id: parentId,
      });
    } catch (error) {

    }
    const isParentUser = parentModelInstance?.__key._id.toString() == ctx.__key;
    // Log("PARENTMODEL", parentModelInstance.__key._id.toString());

    let validAddId = [];
    let validAddNew = [];
    // Log("ACEES_AUTHARIZES", {
    //   parentModel: parentPropertyRule.access,
    //   isParentUser,
    //   key: ctx.__key,
    //   permission: ctx.__permission,
    // });
    //console.log('parentPropertyRule', parentPropertyRule, parts);

    if (
      parentPropertyRule &&
      accessValidator({
        ctx: {
          ...ctx,
          service: 'update',
        },
        rule: parentPropertyRule,
        type: "property",
        isOwner: isParentUser,
      })
    ) {
      if (
        !(more.__parentModel &&
          parentModelPath &&
          parentId &&
          parentProperty)
      ) {
        return await callPost({
          ctx,
          more,
          res: {
            error: "ILLEGAL_ARGUMENT",
            ...(await STATUS.OPERATION_FAILED(ctx, {
              target: controller.name.toLocaleUpperCase(),
              message:
                "__parentModel must be defined: <parentModelPath>_<parentId>_<parentProperty>",
            })),
          },
        });
      }



      /***********************  AddId  ****************** */
      const isAlien = !!(
        parentPropertyRule.alien || parentPropertyRule.strictAlien
      );
      //Log("isAlien", isAlien);
      if (Array.isArray(addId) && isAlien) {
        Log("Je_peux_ajouter_dans_la_list", true);
        const promises = addId.map((id) => {
          return new Promise<string>(async (rev, rej) => {
            try {
              Log('id___',{ id,
                modelPath: controller.name,})
              const validId = (await Local.Controllers['server'].services['instanceId']({
                ...ctx,
                data: {
                  id,
                  modelPath: controller.name,
                }
              }))?.response
              Log('validid',validId);
              if (!validId) {
                return rej(null);
              }
              let canAdd = true;
              parentModelInstance?.[parentProperty].forEach((idInLis: string) => {
                if (idInLis == id) canAdd = false;
              });
              Log('exite__________',canAdd)
              rev(canAdd ? id : null);
            } catch (error) {
              rej(null);
            }
          });
        });
        const result = await Promise.allSettled(promises);
        const validResult = result
          .filter((data: any) => {
            return !!data.value;
          })
          .map((data: any) => {
            return data.value;
          });
        validAddId.push(...validResult);
        Log('valideId', validAddId)
      }


      /***********************  remove : in DB - > in List ****************** */
      try {
        //Log("try", { remove, parentProperty });
        //Log('remove', { remove })
        if (Array.isArray(remove)) {
          for (const id of remove) {
            const impact = parentPropertyRule.impact != false;
            let res: ResultSchema | void | undefined;
            //Log("impact", { impact, parentProperty, parentPropertyRule });
            if (impact) {
              res = await Local.ModelControllers[controller.name]?.services.delete(
                {
                  ...ctx,
                  data: { id },
                },
                more
              );
              // Log("List_remove_res", res);
              if (!res?.response) continue;
            }
            let include = false;
            if (parentModelInstance) parentModelInstance[parentProperty] = parentModelInstance[
              parentProperty
            ].filter((some_id: string) => {
              const equals = some_id == id;
              if (equals) {
                include = true;
              }
              return !(equals);
            });
            if (include) {
              removed = [...(removed || []), id];
            }
          }
        }
      } catch (error: any) {
        await backDestroy(ctx, more);
        return await callPost({
          ctx,
          more,
          res: {
            error: "OPERATION_FAILED4",
            ...(await STATUS.OPERATION_FAILED(ctx, {
              target: controller.name.toLocaleUpperCase(),
              message: error.message,
            })),
          },
        });
      }
      /***********************  AddNew  ****************** */
      //Log("strictAlien", parentPropertyRule.strictAlien);
      Log("addNew", addNew, Array.isArray(addNew) && parentPropertyRule.strictAlien != true);
      if (Array.isArray(addNew) && parentPropertyRule.strictAlien != true) {
        Log("Je_peux_cree_dans_la_list", true);
        const ctrl = Local.ModelControllers[controller.name];
        more.__parentModel = parentModelPath + '_' + parentId + '_' + parentProperty + '_' + controller.name;
        const promises = addNew.map((data) => {
          return new Promise(async (rev, rej) => {
            if (!more?.__parentModel) rej(null);
            const res = await ctrl?.services.create(
              {
                ...ctx,
                data,
              },
              {
                ...more,
                parentList: [...parentModelInstance?.__parentList, {
                  modelPath: parentModelPath,
                  id: parentId,
                }],
              },
            );
            Log('________', res)
            if (!res?.response) {
              Log('@@@@@@@@@@@@@@@@@@@@@@@@@@ rej(null)', res);
              return rej(null);
            }
            else rev(res.response);
          });
        });
        const result = await Promise.allSettled(promises);
        const validResult = result
          .filter((data: any) => {
            return !!data.value;
          })
          .map((data: any) => {
            return data.value;
          });
        validAddNew.push(...validResult);
      } else {
      }

      const hasNewId = validAddNew.length > 0 ||
        validAddId.length > 0
      const canSave = hasNewId ||
        (Array.isArray(remove) && remove.length > 0);
      //Log('added', { added, validAddNew, addId, addNew, validAddId, canSave, hasNewId })
      if (canSave) {
        try {
          if (hasNewId) {
            if (parentModelInstance) parentModelInstance[parentProperty].push([
              ...validAddNew,
              ...validAddId,
            ]);
          }
          await parentModelInstance?.save();
          added = [...validAddNew, ...validAddId];
          Log('added', { added })
          if (parentPropertyRule.emit != false) {
            setTimeout(() => {
              SQuery.IO?.emit('list/' + parentModelPath + '/' + parentProperty + ':' + parentId, {
                added,
                removed
              })
            });
          }
        } catch (error: any) {
          await backDestroy(ctx, more);
          return await callPost({
            ctx,
            more,
            res: {
              error: "OPERATION_FAILED1",
              ...(await STATUS.OPERATION_FAILED(ctx, {
                target: controller.name.toLocaleUpperCase(),
                message: error.message,
              })),
            },
          });
        }
      }

    } else {
      Log("je_ne_peux_pas_modifier", { addId, addNew, remove, query: paging.query, isParentUser, name: controller.name });
    }
    //Log('parent', parentModelInstance);
    //Log('parentModelInstance', { parentModelInstance })
    const query = parentProperty && parentModelInstance ? {
      _id: {
        $in: parentModelInstance?.[parentProperty],
      },
    } : { __key: ctx.__key };
    if (
      parentPropertyRule && !accessValidator({
        ctx: {
          ...ctx,
          service: 'list',
        },
        rule: parentPropertyRule,
        type: "property",
        isOwner: isParentUser
      })
    )
      return await callPost({
        ctx,
        more,
        res: {
          error: "OPERATION_FAILED2",
          status: 404,
          code: "OPERATION_FAILED",
          message:
            "access refused for property <" +
            parentProperty +
            "> , mothod <read>",
        },
      });
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
      page: paging.page || defaultPaging.page,
      limit: paging.limit || defaultPaging.limit,
      sort: paging.sort || defaultPaging.sort,
      select: paging.select || defaultPaging.select,
      lean: defaultPaging.lean,
      populate: false,
      customLabels: myCustomLabels,
    };

    let pagingData = null;
    try {
      pagingData = await Local.ModelControllers[
        controller.name
      ]?.model.paginate(
        query,
        options
      );
      // Log('werty', { pagingData, ...query, options })
      pagingData.added = added;
      pagingData.removed = removed;

      const promise = pagingData.items.map((item: any) => {
        return formatModelInstance(ctx, controller, item);
      });
      await Promise.allSettled(promise);
    } catch (error: any) {
      return await callPost({
        ctx,
        more,
        res: {
          error: "OPERATION_FAILED3",
          status: 404,
          code: "OPERATION_FAILED",
          message: error.message,
        },
      });
    }
    return await callPost({
      ctx,
      more,
      res: {
        response: pagingData,
        ...(await STATUS.OPERATION_SUCCESS(ctx, {
          target: controller.name.toLocaleUpperCase(),
        })),
      },
    });
  };
}