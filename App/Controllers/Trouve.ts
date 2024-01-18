import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { ResponseSchema } from "../../lib/squery/Initialize";
import { SQuery } from "../../lib/squery/SQuery";
import { ModelControllers } from "../Tools/ModelControllers";
import { parentInfo } from "../../lib/squery/ModelCtrlManager";
export const TrouveController = new SQuery.Controller({
  name: "Trouve",
  services: {
    popular: async (ctx: ContextSchema): ResponseSchema => {
      let paging = ctx.data as {
        page: number;
        limit: number;
        index: "like" | "comments" | "shared";
      };
      if (
        paging.index != "like" &&
        paging.index != "comments" &&
        paging.index != "shared"
      )
        return {
          error: "l'index doit etre like|comments|shared",
          code: "ERROR",
          message: "l'index doit etre like|comments|shared",
          status: 404,
        };
      const defaultPaging = {
        page: 1,
        limit: 20,
        index: "like" as const,
      };
      paging = { ...defaultPaging, ...paging };

      const datas = await ModelControllers.post.model.find();
      let res = null;
      try {
        const datasSorted = datas
          .filter((post) => !!post.theme)
          .sort((data1, data2) =>
            data1[paging.index]!.length < data2[paging.index]!.length ? 1 : -1
          );
        res = datasSorted.slice(
          (paging.page - 1) * paging.limit,
          (paging.page - 1) * paging.limit + paging.limit
        );
      } catch (error) {}
      return {
        response: res,
        status: 202,
        code: "OPERATION_SUCCESS",
        message: "c'est zoo!! ..",
      };
    },
    recent: async (ctx: ContextSchema): ResponseSchema => {
      let paging = ctx.data as { page: number; limit: number };
      const defaultPaging = {
        page: 1,
        limit: 20,
      };
      paging = { ...defaultPaging, ...paging };
      const datas = await ModelControllers.post.model.find();
      let res = null;
      try {
        const datasSorted = datas
          .filter((post) => !!post.theme)
          .sort((data1, data2) =>
            (data1!.__createdAt || 0) < (data2!.__createdAt || 0) ? 1 : -1
          );
        res = datasSorted.slice(
          (paging.page - 1) * paging.limit,
          (paging.page - 1) * paging.limit + paging.limit
        );
      } catch (error) {}
      return {
        response: res,
        status: 202,
        code: "OPERATION_SUCCESS",
        message: "c'est zoo!! ..",
      };
    },
    forMe: async (ctx: ContextSchema): ResponseSchema => {
      let paging = ctx.data as { page: number; limit: number };
      const defaultPaging = {
        page: 1,
        limit: 20,
      };
      paging = { ...defaultPaging, ...paging };

      const datas = await ModelControllers.post.model.find({
        __key: ctx.__key,
      });
      let res = null;
      try {
        res = datas.slice(
          (paging.page - 1) * paging.limit,
          (paging.page - 1) * paging.limit + paging.limit
        );
      } catch (error) {}
      return {
        response: res,
        status: 202,
        code: "OPERATION_SUCCESS",
        message: "c'est zoo!! ..",
      };
    },
    les: async (ctx: ContextSchema): ResponseSchema => {
      try {
        let paging = ctx.data as {
          page: number;
          limit: number;
          index: "account" | "post" | "activity" | undefined;
          value: string;
        };
        const defaultPaging = {
          page: 1,
          limit: 20,
          index: undefined,
          value: undefined,
        };
        paging = { ...defaultPaging, ...paging };
        if (
          paging.index != undefined &&
          paging.index != "account" &&
          paging.index != "post" &&
          paging.index != "activity"
        )
          return {
            error: "l'index doit etre  'account' | 'post' | 'activity'",
            code: "ERROR",
            message: "l'index doit etre 'account' | 'post' | 'activity'",
            status: 404,
          };
        if (!paging.value)
          return {
            error: "value doit etre definit",
            code: "ERROR",
            message: "value doit etre definit",
            status: 404,
          };
        let res = {};
        switch (paging.index) {
          case "account":
            res = {
              accounts: await getAccounts(paging),
            };
            break;

          case "activity":
            res = {
              activity: await getActivities(paging),
            };
            break;

          case "post":
            res = {
              postsText: await getPostsText(paging),
              postsTiltle: await getPostsTile(paging),
            };
            break;

          default:
            res = {
              postsText: await getPostsText(paging),
              postsTiltle: await getPostsTile(paging),
              accounts: await getAccounts(paging),
              activity: await getActivities(paging),
            };
            break;
        }
        return {
          response: res,
          status: 202,
          code: "OPERATION_SUCCESS",
          message: "c'est zoo!! ..",
        };
      } catch (error) {
        console.log(error);
      }
    },
  },
});
type pagingType = {
  page: number;
  limit: number;
  index: "account" | "post" | "activity" | undefined;
  value: string;
};
async function getPostsText(paging: pagingType) {
  const regex = new RegExp(paging.value, "i");
  const messages = await ModelControllers.message.model.find({
    text: regex,
  });

  const postsP = messages.map((m) => {
    return new Promise(async (rev, rej) => {
      const info = parentInfo(m.__parentModel || "");
      if (info.parentModelPath != "post") return rej(null);
      const post = await ModelControllers.post.model.findOne({
        _id: info.parentId,
      }).populate({
        path: "message",
        select: "text  file targets account",
        populate: {
          path: "account",
          select: "name status userTarg telephone email",
          populate: {
            path: "profile",
            select: "imgProfile  banner",
          },
        },
      })
      .select("theme type");;
      rev(post);
    });
  });
  const e = (await Promise.allSettled(postsP))
  const posts = e.filter(
    (p) => p.status == "fulfilled"
  ).map((e=>(e as any).value));
  return posts.slice(
    (paging.page - 1) * paging.limit,
    (paging.page - 1) * paging.limit + paging.limit
  );
}

async function getPostsTile(paging: pagingType) {
  const regex = new RegExp(paging.value, "i");
  const posts = await ModelControllers.post.model
    .find({
      $or: [{ type: regex }, { theme: regex }],
    })
    .populate({
      path: "message",
      select: "text  file targets account",
      populate: {
        path: "account",
        select: "name status userTarg telephone email",
        populate: {
          path: "profile",
          select: "imgProfile  banner",
        },
      },
    })
    .select("theme type");
  return posts.slice(
    (paging.page - 1) * paging.limit,
    (paging.page - 1) * paging.limit + paging.limit
  );
}

async function getActivities(paging: pagingType) {
  const regex = new RegExp(paging.value, "i");
  const activities = await ModelControllers.activity.model
    .find({
      name: regex,
    })
    .populate({
      path: "poster",
      select: "imgProfile  banner",
    })
    .select("name");
  return activities.slice(
    (paging.page - 1) * paging.limit,
    (paging.page - 1) * paging.limit + paging.limit
  );
}

async function getAccounts(paging: pagingType) {
  const regex = new RegExp(paging.value, "i");
  const accounts = await ModelControllers.account.model
    .find({
      $or: [{ email: regex }, { name: regex }, { userTarg: regex }],
    })
    .populate({
      path: "profile",
      select: "imgProfile  banner",
    })
    .select("name status userTarg telephone email");

  return accounts.slice(
    (paging.page - 1) * paging.limit,
    (paging.page - 1) * paging.limit + paging.limit
  );
}
