import { load } from '../../p.js';
import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
import SQuery from '../../ts_lib/SQueryClient.js';

const inspectorIsOpen = function() {
    let isOpen = false;
    
    if ((window.outerWidth - window.innerWidth) > 100) {
        isOpen = true;
    }
    
    return isOpen;
  }
  
export class ServicePage extends BaseComponent {
    constructor(data) {
        super({
            ctrl: 'server',
            service: 'validId',
        }, data);
        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,
            _('h1', 'title', 'Service'),
            _('input@modelInput', ['type:text', 'class:model-input', 'placeholder:model path']),
            _('div', 'input-ctn',
                _("textarea@area", ["rows:100", "cols:450"])
            ),
            _('div@send', 'send', 'Send'),
        );
        this.controller = {
            ['@area:change']: (area) => {
                console.log('ATRAYTUYIAOP{A',area.value);
                localStorage.setItem('servicePage:textArea', area.value);

                console.log('Valuejhgach_____{A',area.value);
            },
            ['@modelInput:change']: (input) => {
                try {
                    if (input.value.includes('.')) {
                        const parts = input.value.split('.');
                        this.ctrl = parts[0];
                        this.service = parts[1];
                        //console.log('input.value : ', input.value, parts);
                    } else {
                        this.ctrl = input.value;
                        //console.log('input.value : ', input.value);
                    }
                    const data =  load[this.ctrl]?.[this.service];
                    localStorage.setItem('servicePage:input', input.value)
                    localStorage.setItem('servicePage:textArea', $("textarea").value)
                    if(data){
                        $("textarea").value = localStorage.getItem('servicePage:textArea') || JSON.stringify(data)
                        .split("")
                        .map((c) => {
                            return c == "}" ? "\n}" : c == "{" ? "{\n" : c == "," ? ",\n" : c;
                        }).join("");
                    }
                } catch (error) {
                    alert('Not found : ' + input.value)
                }
            },
            ['@send:click']: async () => {
                console.log('wertyuioiuytrertyui');
                try {
                    console.log(this.ctrl+":"+this.service);
                    SQuery.emit(this.ctrl+":"+this.service,JSON.parse($('textarea').value),(res)=>{
                       
                        console.log(res)
                        if(!inspectorIsOpen()) alert('Open Your Inspector to see the result')
                        $('.title').textContent = window.outerWidth +"<-outer   inner->"+ window.innerWidth+" = "+inspectorIsOpen()
                    })
                } catch (error) {
                    alert('ERROR_SEND')
                }
            },
            [viewName]: () => {
                window.onresize = inspectorIsOpen;
                $("textarea").value =  localStorage.getItem('servicePage:textArea');
                $("input").value = localStorage.getItem('servicePage:input');
                this.emit('@modelInput:change', $('.model-input'))
                
                this.when('error', (error) => {
                    alert(error);
                });

            }
        }
    }
}
Components.ServicePage = ServicePage;






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