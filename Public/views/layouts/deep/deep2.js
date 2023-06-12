import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
import SQuery from "../../ts_lib/SQueryClient.js";

export class Deep extends BaseComponent {
    constructor(data) {
        super({
            id: null,
            modelPath: null,
            description: null,
            parentCpn: null,
            container: null,
            model: null,
            instance: null,
        }, data);
        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,

            _('div', 'top-ctn',
                _('div@back', 'back', 'BACK'),
                _('div@rest', 'rest', 'REFRESH'),
                _('h1', 'title'),
                _('input', 'extarctorPath')
            ),
            _('div', 'container'),
        );
        this.controller = {
            ['.title']: (title) => {
                title.textContent = this.modelPath;
            },
          
            ['.extarctorPath']: (input) => {
                input.addEventListener('blur', async () => {
                    const extracted = await this.instance.extractor(input.value);
                    if (!extracted) alert('the following extraction path is not avalaible. path:' + input.value);
                    if (await SQuery.isInstance(extracted)) {
                        this.emit('hide');
                        this.container.append(_('Deep', {
                            modelPath: extracted.$modelPath,
                            id: extracted.$id,
                            parentCpn: this,
                            container: this.container,
                        }));
                    } else if (await SQuery.isArrayInstance(extracted)) {

                    } else if (await SQuery.isFileInstance(extracted)) {

                    }

                })
            },
            ['@back:click']: async () => {
                if (!this.parentCpn) {
                    const parentInstance = await this.instance.newParentInstance();
                    if (parentInstance) {
                        this.emit('hide');
                        console.log('parentInstance.$modelPath', { parentInstance, modelPath: parentInstance.$modelPath })
                        this.container.append(_('Deep', {
                            modelPath: await parentInstance.$modelPath,
                            id: parentInstance.$id,
                            // parentCpn: this,
                            container: this.container,
                        }));
                        return
                    }
                    return this.emit('error', 'not parent found')
                };

                this.emit('hide');
                this.view.remove();
                this.parentCpn.emit('show');
            },
            ['@rest:click']: async () => {
                // this.container.append(_('Deep', {
                //     id: this.id,
                //     parentCpn: this.parentCpn,
                //     modelPath: this.modelPath,
                //     container: this.container,
                // }))
                // this.view.remove();
                //this.emit('hide');
                //await this.instance.refresh()
            },

            [viewName]: () => {
                /***************************     Init    ********************** */
                this.when('modelPath', async (modelPath) => {
                    /*************************** Mise En Cache ********************** */
                    this.model = await SQuery.model(modelPath);
                    this.instance = await this.model.newInstance({ id: this.id });
                    console.log('model : ', this.model);
                    console.log('instance : ', this.instance);

                    const description = this.description = this.model.description;
                    /***************************   Mise en Correspondance ********************** */

                    for (const property in description) {
                        if (Object.hasOwnProperty.call(description, property)) {
                            const rule = description[property];

                            // //console.log(rule.type, (await this.instance[property]));
                            if (rule.ref) {
                                this.emit('createBtn', {
                                    data: {
                                        modelPath: rule.ref,
                                        property,
                                        id: this.instance.$cache[property],
                                    },
                                    cb: (elem) => $('.container').append(elem),
                                })
                            } else if (rule[0] && rule[0].ref) {
                                ////*console.log('createListBtn');
                                this.emit('createListBtn', {
                                    data: {
                                        modelPath: this.modelPath,
                                        property,
                                        id: this.id,
                                    },
                                    cb: (elem) => $('.container').append(elem),
                                })
                            } else if (rule[0] && rule[0].file) {
                                // //console.log('***********   Array.isArray(rule) && rule[0].file  **************', rule);
                                this.emit('createFile', {
                                    data: {
                                        property: property,
                                        value: await this.instance[property],
                                    },
                                    cb: (elem) => $('.container').append(elem),
                                })
                            } else if (Array.isArray(rule)) {
                                ////*console.log('***********   Array.isArray(rule)  **************', rule);
                            } else {
                                // //console.log('********', rule, property, this.instance);
                                this.emit('createInput', {

                                    data: {
                                        property: property,
                                        value: await this.instance[property],
                                    },
                                    cb: (elem) => $('.container').append(elem),
                                })
                            }
                        }
                    }
                });

                this.when('error', (error) => {
                    alert(error);
                });
                this.when('show', () => {
                    this.view.style.display = 'flex';
                });
                this.when('hide', () => {
                    this.view.style.display = 'none';
                });
                this.when('createBtn', async ({ data, cb }) => {
                    const btn = _('div', 'ref-btn',
                        _('h1', 'model', data.property + ',model=' + data.modelPath),
                        _('input', ['type:text', `value:${data.id}`, 'placeholder:id']),
                    );
                    this.instance.when('refresh:' + data.property, async (e) => {
                        //console.log('*******************************', this.instance, data.property, $(btn, 'input').value);
                        this.waitAnim($(btn, 'input'), 'value', e.value)
                    })
                    $(btn, 'input').addEventListener('blur', async () => {

                        this.instance[data.property] = $(btn, 'input').value;
                        // input.value = await this.instance[data.property]
                    });
                    $(btn, 'h1').addEventListener('click', async () => {

                        this.emit('hide');
                        this.container.append(_('Deep', {
                            ...data,
                            id: (await this.instance[data.property]).$id,
                            parentCpn: this,
                            container: this.container,
                        }));
                    });
                    cb(btn);
                });
                this.when('createListBtn', async ({ data, cb }) => {
                    const btn = _('div', 'ref-btn',
                        _('h1', 'label', 'Show Array'),
                        _('h3', 'id', data.modelPath + '.' + data.property),
                    );

                    btn.addEventListener('click', async () => {
                        this.emit('hide');
                        // //console.log('------- list btn ------', data);
                        this.container.append(_('List', {
                            ...data,
                            id: data.id,
                            parentCpn: this,
                            container: this.container,
                        }));
                    });
                    cb(btn);
                });
                this.when('createInput', ({ data, cb }) => {
                    const input = _('input', ['type:text', `${data.value != undefined ? 'value:' + data.value : ''}`, 'placeholder:' + data.property])
                    input.addEventListener('blur', async () => {
                        ////*console.log(this.instance[data.property]);
                        this.instance[data.property] = input.value;
                        // input.value = await this.instance[data.property]
                    });
                    this.instance.when('refresh:' + data.property, async () => {
                        /// //console.log('#############################', await this.instance[data.property]);
                        let i = 0;
                        const v = await this.instance[data.property];
                        input.value = '';
                        this.waitAnim(input, 'value', v ?? '')

                    })
                    const inputCtn = _('div', 'input-ctn', _('h3', 'property', data.property), input)
                    cb(inputCtn);
                });
                this.when('createFile', async ({ data, cb }) => {
                    let list_a = [];
                    const fileElm = _('input', ['multiple', 'type:file', 'class:file']);
                    fileElm.addEventListener("change", async () => {
                        this.instance[data.property] =[... await this.instance[data.property],...fileElm.files];
                    });
                    let fileCtn =  _('div', 'input-ctn');
                    const inputCtn = _('div', 'input-ctn',
                        _('h3', 'property', data.property),
                        fileElm,
                        fileCtn,
                    );

                    const make = async (_e) => {
                        const a = _('div', 'input-ctn');
                        fileCtn.replaceWith(a)
                        fileCtn = a;
                        list_a= [];
                        _e.value?.forEach((fileData , i) => {
                            const filePath = fileData.url;
                            console.log({ fileData });
                            const del = _('div','delete-file','x');
                            del.addEventListener('click',async()=>{
                                const arr = await this.instance[data.property];
                                arr.splice(i,1);
                                console.log('del',arr);

                                this.instance[data.property] = arr;
                            })
                            const add = _('input', ['multiple', 'type:file', 'class:add-file']);
                            add.addEventListener('change',async ()=>{
                                const arr = await this.instance[data.property];
                                const l = [];
                                for (let i = 0; i < add.files.length; i++) {
                                    l[i]= add.files[i];
                                }
                                arr.splice(i+1,0,...l);
                                console.log('add', arr);
                                this.instance[data.property] = arr ;
                            })
                            list_a.push(_('li', 'file-path',
                                _('a', ['target:_blank', 'href:' + filePath], filePath.length > 40 ? filePath.substring(0, 40) + '...' : filePath),
                                del, add,
                            )
                            );

                        });
                        fileCtn.append(...list_a);
                    }
                    this.instance.when('refresh:' + data.property, make)
                    make({
                        value: await this.instance[data.property],
                    });
                    cb(inputCtn)
                })
            }
        }
    }
    waitAnim(input, property, valurte, time) {
        const d = Date.now();
        input[property] = "";
        const id = setInterval(() => {

            input[property] += " .";

            if (Date.now() >= d + (time || 700)) {
                input[property] = "";
                input[property] = valurte;
                clearInterval(id)
            }
        }, 100);

    }
}
Components.Deep = Deep;