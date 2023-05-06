import fs from "node:fs";
import { Config } from "./Config";
import Log from "sublymus_logger";
console.log(Config);
const relativeDir =__dirname.replace(Config.conf.rootDir,'')
const systemDir = [relativeDir+'/Start'];
Log('log',{relativeDir , systemDir});
[...systemDir,...Config.conf.execDir].forEach(exec)

async function exec(directory: string) {
  const dir = Config.conf.rootDir + directory;
  let files = fs.readdirSync(dir);

  let scripts: string[] = files.filter((file) => {
    return file.endsWith(".ts");
  }).map((file) => {
    file = file.replace(".ts", "");
    return `${dir}/${file}`;
  });

  scripts.forEach(async (script: string) => {
    await import(script);
  });
}

