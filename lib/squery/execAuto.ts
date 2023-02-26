import fs from "node:fs";
import Log from "sublymus_logger";
import { Controllers } from "./Initialize";

['/Start', '/App/Models'].forEach(exec)

function exec(directory: string) {
  const dir = __dirname.substring(0, __dirname.lastIndexOf('/lib')) + directory;
  let files = fs.readdirSync(dir);

  let scripts: string[] = files.map((file) => {
    file = file.replace(".ts", "");
    return `${dir}/${file}`;
  });
  let a = 0;
  scripts.forEach(async (script: string) => {
    for (let i = 0; i < 100; i++) {
    }
    await import(script);
  });
}

