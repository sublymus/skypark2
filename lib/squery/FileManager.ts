import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import Log from "sublymus_logger";
import { ContextSchema } from "./Context"
import {
  FileSchema,
  InstanceDataPathsType,
  ModelServiceAllowed,
  TypeRuleSchema,
  UrlDataType,
} from "./Initialize";
import { SQuery } from "./SQuery";

function isValideType(ruleTypes: string[], type: string): boolean {
  const typeSide = (type || "").split("/");

  let valide = false;
  Log("type!!", { ruleTypes }, { typeSide });
  ruleTypes.forEach((ruleType) => {
    const ruleSide = ruleType.split("/");
    const match = (side: number): boolean => {
      Log("type", { ruleSide }, { typeSide });
      if (ruleSide[side] == "*") return !!typeSide[side];
      else if (
        ruleSide[side].toLocaleLowerCase() == typeSide[side].toLocaleLowerCase()
      )
        return true;
      else return false;
    };

    if (match(0) && match(1)) {
      valide = true;
    }
  });
  return valide;
}
type instanceDataType=  {
  modelPath: string;
  id: string;
  property: string;
}
export async function FileValidator(
  ctx: ContextSchema,
  service: ModelServiceAllowed,
  rule: TypeRuleSchema,
  files: (FileSchema|InstanceDataPathsType)[],
  dataPaths: InstanceDataPathsType[],
  instanceData:instanceDataType
): Promise<InstanceDataPathsType[]> {
  rule.file = rule.file || {};
  if (["create", "store", "update"].includes(service)) {
    //console.log(files);
    dataPaths = [...dataPaths];
    if (!files) return [];
    rule.file.type = rule.file.type || ["*/*"];
    rule.file.type = rule.file.type.length == 0 ? ["*/*"] : rule.file.type;
    rule.file.size = rule.file.size || 2_000_000;
    rule.file.dir = rule.file.dir ||  SQuery.Config.fileDir || ['fs'];
    console.log('file dir', rule.file.dir ,'----' , SQuery.Config.fileDir );
    
    rule.file.length = rule.file.length || 1;

    let sizeMin =
      rule.file.size && Array.isArray(rule.file.size) ? rule.file.size[0] : 0;
    sizeMin = sizeMin < 0 ? 0 : sizeMin;
    let sizeMax = Array.isArray(rule.file.size)
      ? rule.file.size[1]
      : Number.isInteger(rule.file.size)
        ? rule.file.size
        : 10_000_000;
    sizeMax = sizeMax > 15_000_000 ? 15_000_000 : sizeMax;
    let lengthMin =
      rule.file.length && Array.isArray(rule.file.length)
        ? rule.file.length[0]
        : 0;
    lengthMin = lengthMin < 0 ? 0 : lengthMin;
    let lengthMax = Array.isArray(rule.file.length)
      ? rule.file.length[1]
      : Number.isInteger(rule.file.length)
        ? rule.file.length
        : 1;
    lengthMax = lengthMax > 1_000 ? 1_000 : lengthMax;

    if (files.length < lengthMin || files.length > lengthMax)
      throw new Error(
        " Files.length = " +
        files.length +
        "; but must be beetwen [" +
        lengthMin +
        "," +
        lengthMax +
        "]"
      );

    for (const i in files) {
      if (Object.prototype.hasOwnProperty.call(files, i)) {
        const file = files[i];
        if(!IsFileData(file)) continue;
        if (file.size < sizeMin || file.size > sizeMax)
          throw new Error(
            "file.size = " + file.size + "; but must be beetwen [" + sizeMin + "," + sizeMax + "]"
          );
        if (!isValideType(rule.file.type, file.type))
          throw new Error(
            "file.type = " + file.type + "; but is not valide: [" + rule.file.type.toString() + "]"
          );
      }
    }
  }
  const ruleFileDir = path.join(...rule.file.dir || []);
  Log("ruleFileDir", { ruleFileDir });
  await new Promise((res, rej) => {
    if (!fs.existsSync(ruleFileDir)) {
      fs.mkdir(
        ruleFileDir,
        {
          recursive: true,
        },
        (err) => {
          if (err) {
            rej("");
            return Log("dir", err);
          }
          res("");
          return Log("dri", "cree");
        }
      );
    } else {
      res("");
    }
  });
  Log("ok", "ok");
  const Map = {
    create: async () => {
      const newFileData: InstanceDataPathsType[] = [];
      for (const i in files) {
        if (Object.prototype.hasOwnProperty.call(files, i)) {
          const file = files[i];
          if(!IsFileData(file)) continue;
          const data = createPath(file , ruleFileDir , rule , instanceData);
          newFileData.push(data);
        }
      }
      //Log("paths", "created", newFileData);
      return newFileData;
    },
    read: async () => {
      return dataPaths;
    },
    list: async () => {
      return dataPaths;

    },
    update: async () => {
      const lastOKDataPaths: InstanceDataPathsType[] = [];
      for (const p in dataPaths) {
        if (Object.prototype.hasOwnProperty.call(dataPaths,p)) {
          const data = dataPaths[p];
          let existe = files.find(file=>{
            if(IsFileData(file)) return false;
            return file.url === data.url;
          });
          if(!existe){
            deletePath(data);
            continue;
          }
          lastOKDataPaths.push(data);
        }
      }

      const newFileData = files.filter((file)=>{
        if(IsFileData(file)) return true;
        return !!lastOKDataPaths.find(data=>{
          return file.url === data.url;
        })
      }).map((file)=>{
        if(!IsFileData(file)) return file;
        return createPath(file , ruleFileDir , rule , instanceData);
      });

      
      // Log("paths", "created", {lastOKDataPaths,newFileData});
      return newFileData;
    },
    delete: async () => {
      dataPaths.forEach((dataPath) => {
        deletePath(dataPath);
      });
      return dataPaths;
    },
  };
  
  return await Map[service]();
}

function deletePath(dataPath: InstanceDataPathsType) {
  const ulr = dataPath.url
    .substring(dataPath.url.lastIndexOf("/") + 1)
    .replace(dataPath.url.substring(dataPath.url.lastIndexOf(".")), "");
  Log("onUpdateData", dataPath);
  const urlData: UrlDataType = jwt.verify(
    ulr,
     SQuery.Config.URL_KEY || ''
  ) as UrlDataType;
  const actualPath = urlData?.realPath;
  if (!actualPath) return;
  if (fs.existsSync( SQuery.Config.rootDir + actualPath)) {
    fs.unlink( SQuery.Config.rootDir + actualPath, (err) => {
      if (err) {
        Log("important", "can not delete", err);
      }
      Log("important", "deleted", actualPath);
    });
  }
}

function IsFileData( file: any) :file is FileSchema{
  return !!file.buffer ;
}

function createPath(file:FileSchema , ruleFileDir:string , rule:TypeRuleSchema , instanceData: instanceDataType) {
  const exts = file.fileName.split(".");
  const extension = exts[exts.length - 1];
  const path = ruleFileDir +
  "/" +
  Date.now() +
  "_" +
  new mongoose.Types.ObjectId()._id.toString() +
  "." +
  extension;
  
  //Log('length',file.buffer?.length);
  Log('file', file);
  fs.writeFileSync(path, file.buffer, file.encoding || "binary");

  const dataPath =
    jwt.sign(
      {
        realPath: path,
        ...instanceData,
        createdAt: Date.now(),
      },
       SQuery.Config.URL_KEY || ''
    ) + "." +extension;
  let p = (rule.file?.dir || []).join("/") + "/" + dataPath;
  p = p.startsWith("/") ? p : "/" + p;
  // Log("path**", p);
  // Log("rule.file?.dir**", rule.file?.dir);
  // Log("dataPath**", dataPath);
  return  {
    url:p,
    size: file.buffer?.length||file.size,
    extension:extension,
  }
}