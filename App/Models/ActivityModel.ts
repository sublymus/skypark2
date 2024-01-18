import { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import { ProfileController } from "./ProfileModel";
import Log from "sublymus_logger";
import { AccountController } from "./AccountModel";
import { HistoriqueController } from "./Historique";
import { formatModelInstance } from "../../lib/squery/ModelCtrlManager";

let ActivitySchema = SQuery.Schema({
  poster: {
    type: Schema.Types.ObjectId,
    ref: ProfileController.name,
   // required: true,
   default:{
    imgProfile:[],
    banner:[]
   }
  },
  channel: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
      access: "public",
      impact: true,
    },
  ],
  name: {
    type: String,
    required: true,
  },
  listAbonne: [
    {
      type: String,
    },
  ],
  listen: {
    type: Boolean,
  },
  description: {
    type: String,
  },
  icons: [
    {
      type: SQuery.FileType,
      // required: true,
      file: {
        size: 800_000,
        type: ["image/png"],
      },
    },
  ],
});

export const ActivityController = new SQuery.ModelController({
  name: "activity",
  schema: ActivitySchema,
});

ActivityController.post("read", async ({ ctx, res }) => {
  const activity = await ActivityController.model.findOne({
    _id: ctx.data.id,
  });
  if (!activity) return;
  const exist = activity.listAbonne?.find((v) => {
    return v == ctx.login.id;
  });

  return {
    ...res,
    response: {
      ...res.response?._doc,
      listen: !!exist,
    },
  };
});
ActivityController.pre("update", async ({ ctx, more }) => {
  if (ctx.data.listen != undefined) {
    const activity = await ActivityController.model.findOne({
      _id: ctx.data.id,
    });
   
    if (!activity) return;
    
    const account = await AccountController.model.findOne({
      _id: ctx.login.id,
    });
    const historique = await HistoriqueController.model.findOne({
      _id: account?.historique,
    });
    if (ctx.data.listen == true || ctx.data.listen == "true") {
      delete ctx.data.listen;
      //@ts-ignore
      activity.listAbonne = [...activity.listAbonne, ctx.login.id];
    
      //@ts-ignore
      historique?.elements?.unshift({modelName: "activity", id: ctx.data.id, mode: "listen", value: "true",data:{}});
    } else {
      delete ctx.data.listen;
      activity.listAbonne = [
        ...activity.listAbonne?.filter((v) => {
          return v != ctx.login.id;
        }),
      ];
      //@ts-ignore
      historique?.elements?.unshift({modelName: "activity", id: ctx.data.id, mode: "listen", value: "false",data:{}});
    }
    
    await activity.save();
    historique?.save();
  }
});
