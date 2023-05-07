import Log from "sublymus_logger";
import { accessValidator } from "./AccessManager";
import { ContextSchema } from "./Context";
import STATUS from "./Errors/STATUS";
import { Controllers, DescriptionSchema, EventPostSchema, EventPreSchema, ModelControllerSchema, ModelControllers, ModelFrom_optionSchema, ModelInstanceSchema, MoreSchema, ResponseSchema, ResultSchema } from "./Initialize";
import { backDestroy, formatModelInstance } from "./ModelCtrlManager";
import { SQuery } from "./SQuery";

export const listFactory = (controller: ModelControllerSchema, option: ModelFrom_optionSchema & { modelPath: string }, callPost: (e: EventPostSchema) => ResponseSchema, callPre: (e: EventPreSchema) => Promise<void>) => {
  return async (ctx: ContextSchema, more: MoreSchema): ResponseSchema => {
    const service = "list";
    ctx = { ...ctx };
    ctx.service = service;
    ctx.ctrlName = option.modelPath;
    if (!accessValidator(ctx, option.access, "controller")) {
      return await callPost({
        ctx,
        more,
        res: {
          error: "BAD_AUTH_CONTROLLER",
          ...(await STATUS.BAD_AUTH(ctx, {
            target: option.modelPath.toLocaleUpperCase(),
          })),
        },
      });
    }
    let { paging, addNew, addId, remove } = ctx.data;
    let parentModelInstance: ModelInstanceSchema;
    more = {
      ...more,
      savedlist: [],
      __parentModel: paging?.query?.__parentModel,
      modelPath: option.modelPath,
      signupId: ctx.signup?.id,
    };

    await callPre({
      ctx,
      more,
    });
   
   
    paging = paging || {};
    //   Log('remove', { remove })
    const parts = more.__parentModel?.split("_");
    const parentModelPath = parts?.[0];
    const parentId = parts?.[1];
    const parentProperty = parts?.[2];
    let added = undefined;
    let removed = undefined;
    //Log("__parentModel", parts);
    if (
      (addId || addNew) && !(more.__parentModel &&
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
            target: option.modelPath.toLocaleUpperCase(),
            message:
              "__parentModel must be defined: <parentModelPath>_<parentId>_<parentProperty>",
          })),
        },
      });
    }

    const parentDescription: DescriptionSchema =
      ModelControllers[parentModelPath]?.option.schema.description;
    let parentPropertyRule = parentDescription?.[parentProperty];
    if (Array.isArray(parentPropertyRule)) {
      parentPropertyRule = parentPropertyRule?.[0];
    } else {
      parentPropertyRule = parentPropertyRule;
    }

    try {
      parentModelInstance = await ModelControllers[
        parentModelPath
      ]?.option.model.findOne({
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

    if (
      parentPropertyRule ?
        accessValidator(
          ctx,
          parentPropertyRule?.access,
          "property",
          isParentUser
        ) : false
    ) {

      /***********************  AddId  ****************** */
      const isAlien = !!(
        parentPropertyRule.alien || parentPropertyRule.strictAlien
      );
      Log("isAlien", isAlien);
      if (Array.isArray(addId) && isAlien) {
        Log("Je_peux_ajouter_dans_la_list", true);
        const promises = addId.map((id) => {
          return new Promise<string>(async (rev, rej) => {
            try {
              const validId = (await Controllers['server']()['instanceId']({
                ...ctx,
                data: {
                  id,
                  modelPath: option.modelPath,
                }
              })).response
              if (!validId) {
                return rej(null);
              }
              let canAdd = true;
              parentModelInstance[parentProperty].forEach((idInLis) => {
                if (idInLis == id) canAdd = false;
              });
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
      }
      /***********************  AddNew  ****************** */
      Log("strictAlien", parentPropertyRule.strictAlien);
      Log("addNew_is_array", Array.isArray(addNew));
      if (Array.isArray(addNew) && parentPropertyRule.strictAlien != true) {
        Log("Je_peux_cree_dans_la_list", true);
        const ctrl = ModelControllers[option.modelPath]();
        more.__parentModel = parentModelPath+'_'+ parentId+'_'+parentProperty+'_'+option.modelPath;
        const promises = addNew.map((data) => {
          return new Promise(async (rev, rej) => {
            if (!more.__parentModel) rej(null);
            const res = await ctrl.create(
              {
                ...ctx,
                data,
              },
              { ...more },
            );
            if (res.error) rej(null);
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

      /***********************  remove : in DB - > in List ****************** */
      try {
        //Log("try", { remove, parentProperty });
        Log('remove', { remove })
        if (Array.isArray(remove)) {
          for (const id of remove) {
            const impact = parentPropertyRule.impact != false;
            let res: ResultSchema;
            Log("impact", { impact, parentProperty, parentPropertyRule });
            if (impact) {
              res = await ModelControllers[option.modelPath]().delete(
                {
                  ...ctx,
                  data: { id },
                },
                more
              );
              Log("List_remove_res", res);
              if (res.error) continue;
            }
            let include = false;
            parentModelInstance[parentProperty] = parentModelInstance[
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
      } catch (error) {
        await backDestroy(ctx, more);
        return await callPost({
          ctx,
          more,
          res: {
            error: "OPERATION_FAILED4",
            ...(await STATUS.OPERATION_FAILED(ctx, {
              target: option.modelPath.toLocaleUpperCase(),
              message: error.message,
            })),
          },
        });
      }
      const hasNewId = validAddNew.length > 0 ||
        validAddId.length > 0
      const canSave = hasNewId ||
        (Array.isArray(remove) && remove.length > 0);

      if (canSave) {
        try {
          if (hasNewId) {
            parentModelInstance[parentProperty].push([
              ...validAddNew,
              ...validAddId,
            ]);
          }
          await parentModelInstance.save();
          added = [...validAddNew, ...validAddId];
          if (parentPropertyRule.emit!= false) {
            SQuery.io().emit('list/' + parentModelPath + '/' + parentProperty + ':' + parentId, {
              added,
              removed
            })
          }
        } catch (error) {
          await backDestroy(ctx, more);
          return await callPost({
            ctx,
            more,
            res: {
              error: "OPERATION_FAILED1",
              ...(await STATUS.OPERATION_FAILED(ctx, {
                target: option.modelPath.toLocaleUpperCase(),
                message: error.message,
              })),
            },
          });
        }
      }
    } else {
     // Log("je_ne_peux_pas_modifier", { addId, addNew, remove, isParentUser });
    }
    //Log('parent', parentModelInstance);
    //Log('parentModelInstance', { parentModelInstance })
    const query = parentProperty && parentModelInstance ? {
      _id: {
        $in: parentModelInstance?.[parentProperty],
      },
    } : { __key: ctx.__key };
    if (
      parentProperty ? !accessValidator(
        ctx,
        parentPropertyRule.access,
        "property",
        isParentUser
      ) : false
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
      pagingData = await ModelControllers[
        option.modelPath
      ].option.model.paginate(
        query,
        options
      );
      pagingData.added = added;
      pagingData.removed = removed;
      if (!pagingData) {
      }
      const promise = pagingData.items.map((item: any) => {
        return formatModelInstance(ctx, service, option, item);
      });
      await Promise.allSettled(promise);
    } catch (error) {
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
          target: option.modelPath.toLocaleUpperCase(),
        })),
      },
    });
  };
}