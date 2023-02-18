import fs from "node:fs";

const dir = __dirname.substring(0, __dirname.lastIndexOf('/lib')) + "/App/Models";
let files = fs.readdirSync(dir);
const imporUrl = '../../App/Models'
let modelFiles: string[] = files.map((file) => {
  file = file.replace(".ts", "");
  file = file.substring(file.lastIndexOf('/App'))
  return `${imporUrl}/${file}`;
});

const Descriptions = {};
modelFiles.forEach(async (modelFile: string) => {
  const model = await import(modelFile)
  Descriptions[model.default.modelName] = {
    decription: model.default.schema.obj,
    server_controller_access: model.server_controller_access
  };
  // JSON.stringify(model.default.schema)
});
// Log('model', modelList)


export default Descriptions;