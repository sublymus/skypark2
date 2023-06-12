import fs from "node:fs";
import path from "node:path";
import { Config } from "./Config";
const relativeDir = __dirname.replace(Config.conf.rootDir, "");
const systemDir = [path.join(relativeDir, "Start")];
const excDir = Config.conf.execDir||[];
[
  ...systemDir,
  ...excDir.map((link) => {
    return path.join(...link.split("/"));
  }),
].forEach(exec);

excDir.map((link) => {
  console.log({ link });
  return path.join(...link.split("/"));
});

async function exec(directory: string) {
  const dir = path.join(Config.conf.rootDir, directory);
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
