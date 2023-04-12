import { load } from '../../p.js';
import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
import SQuery from '../../ts_lib/SQueryClient.js';

export class CreationPage extends BaseComponent {
    constructor(data) {
        super({
            modelPath: 'user',
            action: 'create',
        }, data);
        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,
            _('h1', 'title', 'Creation'),
            _('input@modelInput', ['type:text', 'class:model-input', 'placeholder:model path']),
            _('div', 'input-ctn',
                _("textarea", ["rows:100", "cols:450"])
            ),
            _('div@create', 'create', 'Create'),
        );
        this.controller = {
            ['@modelInput:change']: (input) => {
                try {
                    if (input.value.includes('.')) {
                        const parts = input.value.split('.');
                        this.modelPath = parts[0];
                        this.action = parts[1];
                        //console.log('input.value : ', input.value, parts);
                    } else {
                        this.modelPath = input.value;
                        //console.log('input.value : ', input.value);
                    }
                    const data = this.action ? load[this.modelPath][this.action] : load[this.modelPath]
                    $("textarea").value = JSON.stringify(data)
                        .split("")
                        .map((c) => {
                            return c == "}" ? "\n}" : c == "{" ? "{\n" : c == "," ? ",\n" : c;
                        })
                        .join("");
                } catch (error) {
                    alert('Not found : ' + input.value)
                }
            },
            ['@create:click']: async () => {
                try {
                    if (!(this.modelPath && this.action)) return this.emit('error', 'input is empty');
                    const Model = await SQuery.Model(this.modelPath);
                    const instance = await Model.create(JSON.parse($('textarea').value));
                    //console.log({ instance });
                    this.emit('next', {
                        modelPath: this.modelPath,//this.type,
                        id: instance.$id,
                    })
                } catch (error) {
                    alert(JSON.stringify(error))
                }
            },
            [viewName]: () => {
                $('.model-input').value = this.modelPath + '.' + this.action;
                this.emit('@modelInput:change', $('.model-input'))
                this.when('error', (error) => {
                    alert(error);
                });

            }
        }
    }
}
Components.CreationPage = CreationPage;






// import { load } from '../../p.js';
// import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
// import SQuery from '../../ts_lib/SQueryClient.js';

// export class CreationPage extends BaseComponent {
//     constructor(data) {
//         super({
//             modelPath: 'user',
//             action: 'create',
//         }, data);
//         const { _, $, $All, viewName } = this.mvc;
//         this.view = _('div', viewName,
//             _('h1', 'title', 'Creation'),
//             _('input@modelInput', ['type:text', 'class:model-input', 'placeholder:model path']),
//             _('div', 'input-ctn',
//                 _("textarea", ["rows:100", "cols:450"])
//             ),
//             _('input', ['multiple', 'type:file', 'class:file']),
//             _('div@create', 'create', 'Create'),
//         );
//         this.controller = {
//             ['@modelInput:change']: (input) => {
//                 try {
//                     if (input.value.includes('.')) {
//                         const parts = input.value.split('.');
//                         this.modelPath = parts[0];
//                         this.action = parts[1];
//                         //console.log('input.value : ', input.value, parts);
//                     } else {
//                         this.modelPath = input.value;
//                         //console.log('input.value : ', input.value);
//                     }
//                     const data = this.action ? load[this.modelPath][this.action] : load[this.modelPath]
//                     $("textarea").value = JSON.stringify(data)
//                         .split("")
//                         .map((c) => {
//                             return c == "}" ? "\n}" : c == "{" ? "{\n" : c == "," ? ",\n" : c;
//                         })
//                         .join("");
//                 } catch (error) {
//                     alert('Not found : ' + input.value)
//                 }
//             },
//             ['@create:click']: async () => {
//                 try {
//                     if (!(this.modelPath && this.action)) return this.emit('error', 'input is empty');
//                     const Model = await SQuery.Model(this.modelPath);
//                     const files = []; 
//                     for (const i in $('.file').files) {
//                         if (Object.hasOwnProperty.call($('.file').files, i)) {
//                             const file = $('.file').files[i];
//                             files.push({
//                                 fileName: file.name || file.fileName,
//                                 size: file.size,
//                                 type: file.type || file.mime,
//                                 buffer: await file.arrayBuffer(),
//                             });
//                         }
//                     }
                    
//                     const instance = await Model.create({
//                         account: {
//                             name: 'baron',
//                             email: $("textarea").value,
//                             password: "azert",
//                             telephone: "12345678",
//                             status: 'property',
//                             address: {
//                                 location: "l:567455;h45678654",
//                                 room: 45,
//                                 door: 296,
//                                 etage: 4,
//                                 description: "je suis ici",
//                             },
//                             favorites: {
//                                 folders: [
//                                     {
//                                         folderName: "wena0",
//                                     },
//                                     {
//                                         folderName: "wena1",
//                                     },
//                                     {
//                                         folderName: "wena2",
//                                     },
//                                     {
//                                         folderName: "wena3",
//                                     },
//                                     {
//                                         folderName: "wena4",
//                                     },
//                                     {
//                                         folderName: "wena5",
//                                     },
//                                 ],
//                             },
//                             profile: {
//                                 imgProfile: files,
//                                 banner: files,
//                                 message: "*** BEST ****",
//                             },
//                             //createdDate: Date.now() - 1_000_000_000 + parseInt(Math.random() * 1_000_000_000),
//                         }
//                     });
//                     //console.log({ instance });
//                     this.emit('next', {
//                         modelPath: this.modelPath,//this.type,
//                         id: instance.$id,
//                     })
//                 } catch (error) {
//                     alert(JSON.stringify(error))
//                 }
//             },
//             [viewName]: () => {
//                 $('.model-input').value = this.modelPath + '.' + this.action;
//                 $("textarea").value = 's@gmail.com'
//                 //  this.emit('@modelInput:change', $('.model-input'))
//                 this.when('error', (error) => {
//                     alert(error);
//                 });

//             }
//         }
//     }
// }
// Components.CreationPage = CreationPage;