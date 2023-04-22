import fs from "node:fs";
import { Config } from "../../squeryconfig";

[(__dirname+'/Start').replace(Config.rootDir,''),...Config.execDir].forEach(exec)

async function exec(directory: string) {
  const dir = Config.rootDir + directory;
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

