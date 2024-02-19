import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { ResponseSchema } from "../../lib/squery/Initialize";
import { SQuery } from "../../lib/squery/SQuery";
import { ModelControllers } from "../Tools/ModelControllers";
import { parentInfo } from "../../lib/squery/ModelCtrlManager";
import { FavoritesController } from "../Models/FavoritesModel";
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

      const datas = await ModelControllers.post.model
        .find()
        .populate({
          path: "message",
          select: "text files targets account __createdAt",
          populate: {
            path: "account",
            select: "name status userTarg telephone email",
            populate: {
              path: "profile",
              select: "imgProfile  banner",
            },
          },
        })
        .select("theme type like statPost comments shared");
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
      const datas = await ModelControllers.post.model
        .find()
        .populate({
          path: "message",
          select: "text files targets account __createdAt",
          populate: {
            path: "account",
            select: "name status userTarg telephone email",
            populate: {
              path: "profile",
              select: "imgProfile  banner",
            },
          },
        })
        .select("theme type statPost");

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
    favorites: async (ctx: ContextSchema): ResponseSchema => {
      let paging = ctx.data as { page: number; limit: number };
      const defaultPaging = {
        page: 1,
        limit: 20,
      };
      paging = { ...defaultPaging, ...paging };
      let res = null;
      try {
        const favorites = await FavoritesController.model.findOne({
          __key: ctx.__key,
        });

        if (!(favorites && favorites.elements))
          return {
            error: "pas d'favorite",
            code: "ERROR",
            message: "pas d'favorite",
            status: 404,
          };
        const promises = favorites.elements
          //@ts-ignore
          .filter((p) => p.modelName == "post")
          .map(
            (p) =>
              new Promise(async (rev, rej) => {
                const post = await ModelControllers.post.model
                  .findOne({
                    _id: p.id,
                  })
                  .populate({
                    path: "message",
                    select: "text files targets account __createdAt",
                    populate: {
                      path: "account",
                      select: "name status userTarg telephone email",
                      populate: {
                        path: "profile",
                        select: "imgProfile  banner",
                      },
                    },
                  })
                  .select("theme type survey statPost __parentModel");
                if (!post) return rej(null);
                rev(post);
              })
          );

        const posts = (await Promise.allSettled(promises))
          // @ts-ignore
          .filter((f) => f.status == "fulfilled" && !!f.value.theme)
          // @ts-ignore
          .map((f) => f.value);
        res = posts.slice(
          (paging.page - 1) * paging.limit,
          (paging.page - 1) * paging.limit + paging.limit
        );
      } catch (error) {
        console.log(error);
      }
      return {
        response: res,
        status: 202,
        code: "OPERATION_SUCCESS",
        message: "c'est zoo!! ..",
      };
    },
    mesReponses: async (ctx: ContextSchema): ResponseSchema => {
      let paging = ctx.data as { page: number; limit: number };
      const defaultPaging = {
        page: 1,
        withTheme: true,
        account: ctx.login.id,
        limit: 20,
      };
      paging = { ...defaultPaging, ...paging };

      const datas = await ModelControllers.post.model
        .find({ __key: ctx.__key })
        .populate({
          path: "message",
          select: "text files targets account __createdAt",
          populate: {
            path: "account",
            select: "name status userTarg telephone email",
            populate: {
              path: "profile",
              select: "imgProfile  banner",
            },
          },
        })
        .select("theme type survey statPost __parentModel");

      let res = null;
      try {
        const promises = datas.map(
          (post) =>
            new Promise(async (rev, rej) => {
              const parentId = parentInfo(post.__parentModel || "").parentId;
              const parent = await ModelControllers.post.model
                .findOne({
                  _id: parentId,
                })
                .populate({
                  path: "message",
                  select: "text files targets account __createdAt",
                  populate: {
                    path: "account",
                    select: "name status userTarg telephone email",
                    populate: {
                      path: "profile",
                      select: "imgProfile  banner",
                    },
                  },
                })
                .select("theme type survey statPost __parentModel");
              if (!parent?.theme) return rej(null);
              rev({ post, parent, parentId });
            })
        );
        const datasSorted = (await Promise.allSettled(promises))
          .filter((p) => p.status == "fulfilled")
          .map((p) => (p as any).value);
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
    enAttente: async (ctx: ContextSchema): ResponseSchema => {
      let paging = ctx.data as { page: number; limit: number };
      const defaultPaging = {
        page: 1,
        limit: 20,
      };
      paging = { ...defaultPaging, ...paging };

      const datas = await ModelControllers.post.model
        .find({ __key: ctx.__key })
        .populate({
          path: "message",
          select: "text files targets account __createdAt",
          populate: {
            path: "account",
            select: "name status userTarg telephone email",
            populate: {
              path: "profile",
              select: "imgProfile  banner",
            },
          },
        })
        .select("theme type survey statPost");
      let res = null;
      try {
        const promises = datas.map(
          (post) =>
            new Promise(async (rev, rej) => {
              const res = await ModelControllers.post.services.read({
                ...ctx,
                data: { id: post._id.toString() },
              });
              if (!post?.theme) return rej(null);
              if (!res?.response?.statPost) return rej(null);
              if (res?.response.statPost.comments != 0) return rej(null);
              rev(post);
            })
        );
        const datasSorted = (await Promise.allSettled(promises))
          .filter((p) => p.status == "fulfilled")
          .map((p) => (p as any).value);
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
    byAccount: async (ctx: ContextSchema): ResponseSchema => {
      let paging = ctx.data as {
        account: string;
        page: number;
        limit: number;
        withTheme: boolean;
      };
      const defaultPaging = {
        page: 1,
        account: ctx.login.id,
        limit: 20,
        withTheme: false,
      };
      paging = { ...defaultPaging, ...paging };
      const account = await ModelControllers.account.model.findOne({
        _id: paging.account,
      });
      if (!account || !account.__key)
        return {
          error: "l'id du account non trouvee",
          code: "ERROR",
          message: "l'id du account non trouvee",
          status: 404,
        };
      const datas = await ModelControllers.post.model
        .find({ __key: account.__key.toString() })
        .populate({
          path: "message",
          select: "text files targets account __createdAt",
          populate: {
            path: "account",
            select: "name status userTarg telephone email",
            populate: {
              path: "profile",
              select: "imgProfile  banner",
            },
          },
        })
        .select("theme type survey statPost");
      let res = null;
      try {
        const datasSorted = paging.withTheme
          ? datas.filter((post) => !!post.theme)
          : datas;
        // .filter((post) => !!post.theme)
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
    accountByTag: async (ctx: ContextSchema): ResponseSchema => {
      let paging = ctx.data as {
        userTag: string;
      };
      console.log({ paging });
      if (!paging.userTag)
        return {
          error: "l' account non trouvee",
          code: "ERROR",
          message: "l  account non trouvee",
          status: 404,
        };

      const account = await ModelControllers.account.model
        .findOne({ userTarg: paging.userTag })
        .populate({
          path: "profile",
          select: "imgProfile banner",
        })
        .populate({
          path: "address",
          select: "room city etage description",
        })
        .select("name status userTarg telephone email");
      if (!account)
        return {
          error: "l'id du account non trouvee",
          code: "ERROR",
          message: "l'id du account non trouvee",
          status: 404,
        };
      return {
        response: account,
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
      const post = await ModelControllers.post.model
        .findOne({
          _id: info.parentId,
        })
        .populate({
          path: "message",
          select: "text files targets account __createdAt",
          populate: {
            path: "account",
            select: "name status userTarg telephone email",
            populate: {
              path: "profile",
              select: "imgProfile  banner",
            },
          },
        })
        .select("theme type statPost __createdAt");
      rev(post);
    });
  });
  const e = await Promise.allSettled(postsP);
  const posts = e
    .filter((p) => p.status == "fulfilled")
    .map((e) => (e as any).value);
  return posts.slice(
    (paging.page - 1) * paging.limit,
    (paging.page - 1) * paging.limit + paging.limit
  );
}

async function getPostsTile(paging: pagingType) {
  const regex = new RegExp(paging.value, "i");
  const posts = await ModelControllers.post.model
    .find({
      theme: regex,
    })
    .populate({
      path: "message",
      select: "text files targets account __createdAt",
      populate: {
        path: "account",
        select: "name status userTarg telephone email",
        populate: {
          path: "profile",
          select: "imgProfile  banner",
        },
      },
    })
    .select("theme type statPost");
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
      select: "imgProfile banner",
    })
    .populate({
      path: "address",
      select: "room city etage description",
    })
    .select("name status userTarg telephone email");

  return accounts.slice(
    (paging.page - 1) * paging.limit,
    (paging.page - 1) * paging.limit + paging.limit
  );
}
