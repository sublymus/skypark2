// import { ModelControllers, ModelFrom_optionSchema, bindData } from "./Initialize";
// import { listenerSchema } from "./event/eventEmiter";
// type dataSc = {
//     id: string,
//     doc: { [p: string]: any },
//     properties: string[],
// }
// export class Bindings {
//     private paths: string[];
//     private sourcePath: string
//     private targetPath: string;
//     private sourceParts: string[];
//     private illegalMessage: string;
//     constructor(private option: ModelFrom_optionSchema & { modelPath: string }) {

//         option?.bind.forEach((bindData) => {
//             const mode = bindData.pattern.includes('=>') ? 'unidirectional' : (bindData.pattern.includes('<=>') ? 'bidirectional' : "error")
//             if (mode == 'error') throw new Error("Invalid Pattern. the avalaible pattern must be include => or <=>; Exemple ./home/color => ./dress/color");

//             this.paths = bindData.pattern.split(mode == 'bidirectional' ? '<=>' : '=>');
//             this.sourcePath = this.paths[0];
//             this.targetPath = this.paths[1];
//             this.sourceParts = this.sourcePath.split('/');
//             this.illegalMessage = "Invalid Pattern: the source path is incorrect; Example : ./home , ./home/property/name";

//             if (this.sourceParts[0] != '.') throw new Error(this.illegalMessage);

//             bindData.rootParts = ['root', "account", "address", "id"];
//             bindData.rootIdParts = {};
//             bindData.mode = 'bidirectional';
//         })
//     }

//     deepListener(rootId: string, bindData: bindData, currentIndex: number, parentModelPath: string, parentProperty: string, parentData: dataSc) {
//         if (!parentData.properties.includes(parentProperty)) return;
//         const description = ModelControllers[parentModelPath].option.schema.description;
//         const rule = description[parentProperty]
//         if (Array.isArray(rule)) throw new Error('Binging_ERROR: Array is not permit on the source path')
//         if (!rule.ref) {
//             //
//         }
//         const rootIdParts = bindData.rootIdParts[rootId];
//         bindData.emiter.remove({
//             event: rule.ref + ":" + rootIdParts.parts[currentIndex],
//             uid: rule.ref + ":" + rootIdParts.parts[currentIndex]
//         })
//         rootIdParts.parts[currentIndex] = parentData.doc[parentProperty];
//         const uid = rule.ref + ":" + parentData.doc[parentProperty];
//         const listener: listenerSchema = (value, e) => {
//             this.deepListener(rootId, bindData, currentIndex + 1, rule.ref, bindData.rootParts[currentIndex+1], value)
//         };
//         listener.uid = uid;
//         bindData.emiter.when(uid, listener);
//     }
//     isValidProperty = (part: string) => {
//         return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(part);
//     }
// }