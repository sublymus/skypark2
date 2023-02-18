import fs from "node:fs";

const dir = __dirname.substring(0, __dirname.lastIndexOf('/lib')) + "/Start";
let files = fs.readdirSync(dir);

let scripts: string[] = files.map((file) => {
  file = file.replace(".ts", "");
  return `${dir}/${file}`;
});
scripts.every(async (script: string) => {
  await import(script);
});
