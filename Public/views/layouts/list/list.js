import { load } from '../../p.js';
import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
import SQuery from "../../ts_lib/SQueryClient.js";

export class List extends BaseComponent {
    constructor(data) {
        super({
            id: null,
            modelPath: null,
            property: null,
            propertyDescription: null,
            parentCpn: null,
            container: null,
            modelInstance: null,
            arrayInstance: null,
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
            _('div', 'option',
                _('textarea'),
                _('div@update', 'update', 'UPDATE'),
                _('div', 'move-ctn',
                    _('div@prev', 'btn-prev', 'PREV'),
                    _('input@index', ['class:page-input', 'type:number', 'min:1', 'value:1']),
                    _('div@next', 'btn-next', 'NEXT'),
                    _('div@refresh', 'btn-refresh', 'refresh'),
                    _('div@last', 'btn-last', 'LAST'),
                ),
            ),
            _('div', 'container'),
        );
        this.controller = {
            ['@refresh:click']: async () => {
                const arrayData = await this.arrayInstance.page();
                console.log({ arrayData });
                setTimeout(async () => {
                    console.log('itemsInstance', await arrayData['itemsInstance']);
                    console.log({ arrayData });
                }, 5000);
            },
            ['@last:click']: async () => {
                await this.arrayInstance.last();
            },
            ['@prev:click']: async () => {
                await this.arrayInstance.back();
            },
            ['@next:click']: async () => {
                await this.arrayInstance.next();
            },
            ['@index:change']: async (input) => {
                await this.arrayInstance.page(input.value);
            },
            ['.title']: (title) => {
                title.textContent = this.modelPath + '.' + this.property;
            },
            ['textarea']: (area) => {
                area.value = $('textarea').value = JSON.stringify(load['list']).split('').map((c) => {
                    return c == '}' ? '\n}' : (c == '{' ? '{\n' : (c == ',' ? ',\n' : c))
                }).join('');
            },
            ['@back:click']: () => {
                if (!this.parentCpn) return this.emit('error', 'not parent found');
                this.emit('hide');
                this.view.remove();
                this.parentCpn.emit('show');
            },
            ['@update:click']: () => {
                const option = JSON.parse($('textarea').value);
                this.arrayInstance.update(option);
            },
            ['@rest:click']: () => {
                this.container.append(_('List', {
                    id: this.id,
                    parentCpn: this.parentCpn,
                    modelPath: this.modelPath,
                    container: this.container,
                    property: this.property,
                }))
                this.view.remove();
                this.emit('hide');
            },
            [viewName]: async () => {
                /***************************     Init    ********************** */
                this.when('modelPath', async (modelPath) => {
                    this.model = await SQuery.Model(modelPath);
                    this.modelInstance = await this.model.instance({ id: this.id });
                    this.description = this.model.description;
                    this.arrayInstance = (await this.modelInstance[this.property])

                    this.arrayInstance.when('data', (data) => {
                        this.emit('createList', data)
                    })
                    await this.arrayInstance.update({
                        paging: {
                            limit: 3
                        }
                    })
                });
                this.when('createList', async (data) => {
                    $All('.container > *')?.forEach(elm => {
                        elm.remove()
                    })
                    $('.page-input').value = data.page;
                    const rule = this.description[this.property];
                    if (rule[0] && rule[0].ref) {


                        for (let i = 0; i < data.items.length; i++) {
                            const item = data.items[i];
                            this.emit('createBtn', {
                                data: {
                                    modelPath: rule[0].ref,
                                    id: item._id,
                                },
                                cb: (elem) => $('.container').append(elem),
                            });
                        }
                    } else {
                        $('.container').append(_('h1', '', 'Not Array Found'));
                    }
                })
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
            }
        }
    }
}
Components.List = List;