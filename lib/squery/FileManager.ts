import Log from "sublymus_logger";
import { ContextSchema } from "./Context";
import { FileSchema, ModelServiceAvailable, TypeRuleSchema, UrlDataType } from "./Initialize";
import fs from "node:fs";
import { Config } from "./Config";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

function isValideType(ruleTypes: string[], type: string): boolean {
    const typeSide = (type || "").split("/");

    let valide = false;
    Log("type!!", { ruleTypes }, { typeSide });
    ruleTypes.forEach((ruleType) => {
        const ruleSide = ruleType.split("/");
        const match = (side: number): boolean => {
            Log("type", { ruleSide }, { typeSide });
            if (ruleSide[side] == "*") return true;
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
export async function FileValidator(
    ctx: ContextSchema,
    service: ModelServiceAvailable,
    rule: TypeRuleSchema,
    files: FileSchema[],
    dataPaths: string[],
    instanceData: {
        modelPath: string,
        id: string,
        property: string
    }
): Promise<string[]> {
    if (["create", "store", "update"].includes(service)) {
        //console.log(files);

        if (!files) return;
        rule.file.type = rule.file.type || ["*/*"];
        rule.file.type = rule.file.type.length == 0 ? ["*/*"] : rule.file.type;
        rule.file.size = rule.file.size || 2_000_000;
        rule.file.dir = rule.file.dir || Config.conf.rootDir + "/temp";
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
                if (file.size < sizeMin || file.size > sizeMax)
                    throw new Error(
                        "file.size = " +
                        file.size +
                        "; but must be beetwen [" +
                        sizeMin +
                        "," +
                        sizeMax +
                        "]"
                    );
                if (!isValideType(rule.file.type, file.type))
                    throw new Error(
                        "file.type = " +
                        file.type +
                        "; but is not valide: [" +
                        rule.file.type.toString() +
                        "]"
                    );
            }
        }
    }

    await new Promise((res, rej) => {
        if (!fs.existsSync(rule.file.dir)) {
            fs.mkdir(
                rule.file.dir,
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

    const Map = {
        create: async () => {
            const paths: string[] = [];
            for (const i in files) {
                if (Object.prototype.hasOwnProperty.call(files, i)) {
                    const file = files[i];
                    const extension = file.type.substring(file.type.indexOf("/") + 1);
                    const path =
                        rule.file.dir +
                        "/" +
                        Date.now() +
                        "_" +
                        new mongoose.Types.ObjectId()._id.toString() +
                        "." +
                        extension;
                    fs.writeFileSync(path, file.buffer, file.encoding || "binary");
                    const dataPath = jwt.sign(
                        {
                            realPath: path.replace(Config.conf.rootDir, ""),
                            ...instanceData,
                            createdAt: Date.now(),
                        },
                        Config.conf.URL_KEY
                    );
                    Log('path**', rule.file.dir.replace(Config.conf.rootDir, "") + '/' + dataPath)
                    paths.push(rule.file.dir.replace(Config.conf.rootDir, "") + '/' + dataPath);
                }
            }
            Log("paths", "created", paths);
            return paths;
        },
        read: async () => {
            return dataPaths;
        },
        update: async () => {
            const paths: string[] = [];
            for (const i in files) {
                if (Object.prototype.hasOwnProperty.call(files, i)) {
                    const file = files[i];
                    const extension = file.type.substring(file.type.indexOf("/") + 1);
                    const path =
                        rule.file.dir +
                        "/" +
                        Date.now() +
                        "_" +
                        new mongoose.Types.ObjectId()._id.toString() +
                        "." +
                        extension;
                    fs.writeFileSync(path, file.buffer, file.encoding || "binary");
                    const dataPath = jwt.sign(
                        {
                            realPath: path.replace(Config.conf.rootDir, ""),
                            ...instanceData,
                            createdAt: Date.now(),
                        },
                        Config.conf.URL_KEY
                    );
                    Log('path**', rule.file.dir.replace(Config.conf.rootDir, "") + '/' + dataPath)
                    paths.push(rule.file.dir.replace(Config.conf.rootDir, "") + '/' + dataPath);
                }
            }
            Log("paths", "created", paths);
            dataPaths.forEach((dataPath) => {
                dataPath = dataPath.substring(dataPath.lastIndexOf('/') + 1, dataPath.length)
                Log('onUpdateData', dataPath)
                const urlData: UrlDataType = (jwt.verify(dataPath, Config.conf.URL_KEY) as UrlDataType)
                const actualPath = urlData?.realPath;
                if (!actualPath) return;
                if (fs.existsSync(Config.conf.rootDir + actualPath)) {
                    fs.unlink(Config.conf.rootDir + actualPath, (err) => {
                        if (err) {
                            Log("important", "can not delete", err);
                        }
                        Log("important", "deleted", actualPath);
                    });
                }
            });
            return paths;
        },
        delete: async () => {
            dataPaths.forEach((dataPath) => {
                dataPath = dataPath.substring(dataPath.lastIndexOf('/') + 1, dataPath.length)
                Log('onDeleteData', dataPath)
                const urlData: UrlDataType = (jwt.verify(dataPath, Config.conf.URL_KEY) as UrlDataType)
                const actualPath = urlData.realPath;
                if (!actualPath) return;
                if (fs.existsSync(Config.conf.rootDir + actualPath)) {
                    fs.unlink(Config.conf.rootDir + actualPath, (err) => {
                        if (err) {
                            Log("important", "can not delete", err);
                        }
                        Log("important", "deleted", actualPath);
                    });
                }
            });
            return dataPaths;
        },
    };
    if (service == "store") service = "create";
    else if (service == "destroy") service = "delete";

    return await Map[service]();
}
