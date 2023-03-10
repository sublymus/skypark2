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
                    this.model = await SQuery.Model(modelPath);
                    this.instance = await this.model.instance({ id: this.id });
                    console.log('model : ', this.model);
                    console.log('instance : ', this.instance);

                    const description = this.description = this.model.description;
                    /***************************   Mise en Correspondance ********************** */

                    for (const property in description) {
                        if (Object.hasOwnProperty.call(description, property)) {
                            const rule = description[property];
                            
                           // console.log(rule.type, (await this.instance[property]));
                            if (rule.ref) {
                                this.emit('createBtn', {
                                    data: {
                                        modelPath: rule.ref,
                                        id: (await this.instance[property]).id,
                                    },
                                    cb: (elem) => $('.container').append(elem),
                                })
                            } else if (rule[0] && rule[0].ref) {
                                console.log('createListBtn');
                                this.emit('createListBtn', {
                                    data: {
                                        modelPath: this.modelPath,
                                        property,
                                        id: this.id,
                                    },
                                    cb: (elem) => $('.container').append(elem),
                                })
                            } else if (rule[0] && rule[0].file) {
                                // console.log('***********   Array.isArray(rule) && rule[0].file  **************', rule);
                                this.emit('createFile', {
                                    data: {
                                        property: property,
                                        value: await this.instance[property],
                                    },
                                    cb: (elem) => $('.container').append(elem),
                                })
                            } else if (Array.isArray(rule)) {
                                //console.log('***********   Array.isArray(rule)  **************', rule);
                            } else {
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
                        _('h1', 'model', data.modelPath),
                        _('h3', 'id', await data.id),
                    );
                    btn.addEventListener('click', async () => {
                        this.emit('hide');
                        this.container.append(_('Deep', {
                            ...data,
                            id: await data.id,
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
                        console.log('------- list btn ------', data);
                        this.container.append(_('List', {
                            ...data,
                            id: await data.id,
                            parentCpn: this,
                            container: this.container,
                        }));
                    });
                    cb(btn);
                });
                this.when('createInput', ({ data, cb }) => {
                    const input = _('input', ['type:text', `value:${data.value}`, 'class:password', 'placeholder:' + data.property])
                    input.addEventListener('blur', () => {
                        this.instance[data.property] = input.value;
                    });
                    const inputCtn = _('div', 'input-ctn', _('h3', 'property', data.property), input)
                    cb(inputCtn);
                });
                this.when('createFile', async ({ data, cb }) => {
                    const fileElm = _('input', ['multiple', 'type:file', 'class:file']);
                    fileElm.addEventListener("change", async () => {
                        this.instance[data.property] = fileElm.files;
                    });
                    const f = [];
                    (data.value).forEach(filePath => {
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