import fs from "node:fs";
import path from "node:path";
import { ConfigInterface } from "./SQuery_config";

export async function AutoExecuteDir(Config : ConfigInterface){
  const relativeDir = __dirname.replace(Config.rootDir, "");
  console.log('relativeDir',relativeDir);
  
  const systemDir = [path.join(relativeDir, "Start")];
  const excDir = Config.execDir||[];
  
  const list = [
    ...systemDir,
    ...excDir.map((link) => {
      return path.join(...link.split("/"));
    }),
  ];
  
  async function exec(directory: string) {
    const dir = path.join(Config.rootDir, directory);
    let files = fs.readdirSync(dir);
  
    let scripts: string[] = files
      .filter((file) => {
        return file.endsWith(".ts");
      })
      .map((file) => {
        file = file.replace(".ts", "");
        return `${dir}/${file}`;
      });
  
    scripts.forEach(async (script: string) => {
      await import(script);
    });
  }

  for (let i = 0; i < list.length; i++) {
    await exec(list[i]);
  }
}