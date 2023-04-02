import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
import SQuery from "../../ts_lib/SQueryClient.js";


export class Deep extends BaseComponent {
    constructor(data) {
        super({
            id: null,
            modelPath: null,
            description: null,
            cache: null,
            parentCpn: null,
            container: null
        }, data);
        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,
            _('div', 'top-ctn',
                _('div@back', 'back', 'BACK'),
                _('div@rest', 'rest', 'REFRESH'),
                _('h1', 'title'),
            ),
            _('div', 'container'),
        );
        this.controller = {
            ['.title']: (title) => {
                title.textContent = this.modelPath;
            },
            ['@back:click']: () => {
                if (!this.parentCpn) return this.emit('error', 'not parent found');
                this.emit('hide');
                this.view.remove();
                this.parentCpn.emit('show');
            },
            ['@rest:click']: () => {
                this.container.append(_('Deep', {
                    id: this.id,
                    parentCpn: this.parentCpn,
                    modelPath: this.modelPath,
                    container: this.container,
                }))
                this.view.remove();
                this.emit('hide');
            },

            [viewName]: () => {
                /***************************     Init    ********************** */
                this.when('modelPath', async (modelPath) => {
                    /*************************** Mise En Cache ********************** */
                    const description = this.description = await SQuery.getDesription(modelPath);
                    await new Promise((rev) => {
                        SQuery.socket.emit(modelPath, {
                            __action: 'read',
                            id: this.id,
                        }, (res) => {
                            this.cache = res.response;
                            rev(this.cache);
                            //console.log(modelPath, this.cache);
                        });
                    })
                    //console.log(description);
                    /***************************   Mise en Correspondance ********************** */
                    for (const property in description) {
                        if (Object.hasOwnProperty.call(description, property)) {
                            const rule = description[property];
                            //console.log('  **************', rule);
                            if (rule.ref) {
                                //console.log('***********   rule.ref  **************', rule);
                                this.emit('createBtn', {
                                    data: {
                                        modelPath: rule.ref,
                                        id: this.cache[property],
                                    },
                                    cb: (elem) => $('.container').append(elem),
                                })
                            } else if (rule[0] && rule[0].ref) {
                                //console.log('***********   Array.isArray(rule) && rule[0].ref  **************', rule);
                            } else if (rule[0] && rule[0].file) {
                                //console.log('***********   Array.isArray(rule) && rule[0].file  **************', rule);
                                this.emit('createFile', {
                                    data: {
                                        value: this.cache[property],
                                        property: property
                                    },
                                    cb: (elem) => $('.container').append(elem),
                                })
                            } else if (Array.isArray(rule)) {
                                //console.log('***********   Array.isArray(rule)  **************', rule);
                            } else {
                                this.emit('createInput', {
                                    data: {
                                        value: this.cache[property],
                                        property: property
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
                this.when('createBtn', ({ data, cb }) => {
                    const btn = _('div', 'ref-btn',
                        _('h1', 'model', data.modelPath),
                        _('h3', 'id', data.id),
                    );
                    btn.addEventListener('click', () => {
                        this.emit('hide');
                        this.container.append(_('Deep', {
                            ...data,
                            parentCpn: this,
                            container: this.container,
                        }));
                    });
                    cb(btn);
                    //$('.container').append(btn);
                });
                this.when('createInput', ({ data, cb }) => {
                    const input = _('input', ['type:text', `value:${data.value}`, 'class:password', 'placeholder:' + data.property])
                    let verif = true;
                    input.addEventListener('blur', () => {
                        //if (!verif) return verif = true;
                        if (input.value == this.cache[data.property]) return;
                        const result = SQuery.Validatior(this.description[data.property], input.value);
                        if (result.value == undefined) {
                            verif = false;
                            return alert('Invalide Value :' + input.value + ' \n because : ' + result.message);
                        }
                        SQuery.socket.emit(this.modelPath, {
                            __action: 'update',
                            id: this.id,
                            [data.property]: result.value
                        }, (res) => {
                            if (res.error) return alert(JSON.stringify(res));
                            this.cache[data.property] = res.response[data.property]
                        });
                    });
                    const inputCtn = _('div', 'input-ctn', _('h3', 'property', data.property), input)
                    cb(inputCtn);
                    //(//input);
                });
                this.when('createFile', ({ data, cb }) => {
                    const fileElm = _('input', ['multiple', 'type:file', 'class:file']);
                    fileElm.addEventListener("change", async () => {
                        const files = [];
                        for (const p in fileElm.files) {
                            if (Object.hasOwnProperty.call(fileElm.files, p)) {
                                const file = fileElm.files[p];
                                const fileData = {
                                    fileName: file.name,
                                    size: file.size,
                                    type: file.type,
                                    buffer: await file.arrayBuffer(),
                                };
                                files.push(fileData);
                            }
                        }
                        const result = SQuery.Validatior(this.description[data.property], files);
                        if (result.value == undefined) {
                            return alert('Invalide Value :' + input.value + ' \n because : ' + result.message);
                        }
                        SQuery.socket.emit(this.modelPath, {
                            __action: 'update',
                            id: this.id,
                            [data.property]: files
                        }, (res) => {
                            if (res.error) return alert(JSON.stringify(res));
                            this.cache[data.property] = res.response[data.property]
                        });
                    });
                    const f = [];
                    data.value.forEach(filePath => {
                        f.push(_('a', ['target:_blank', 'href:' + filePath], filePath.substring(filePath.lastIndexOf('/'))), _('br'));
                    });

                    const inputCtn = _('div', 'input-ctn', _('h3', 'property', data.property), fileElm, _('br'), ...f)
                    cb(inputCtn)
                })
            }
        }
    }
}
Components.Deep = Deep;