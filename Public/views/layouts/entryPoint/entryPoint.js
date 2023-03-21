import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
import SQuery from '../../ts_lib/SQueryClient.js';

export class EntryPoint extends BaseComponent {
    constructor(data) {
        super({
            model: 'user',
            descriptions: {}
        }, data);
        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,
            _('h1', 'title', 'LOGIN'),
            _('select@model', 'model'),
            _('div', 'input-ctn',
                _('input', ['type:text', 'class:password', 'placeholder:id'])
            ),
            _('div@submit', 'next', 'NEXT'),
        );

        this.controller = {
            ['@model:change']: (select) => {
                this.model = select.value;
                console.log(select.value);
            },
            ['@submit:click']: () => {
                if (!$('input').value) return this.emit('error', 'id is empty');
                this.emit('next', {
                    modelPath: this.model,//this.type,
                    id: $('input').value,
                })
            },
            [viewName]: async () => {
                this.when('descriptions', (descriptions) => {
                    $('select').childNodes.forEach(option => {
                        option.remove();
                    });
                    console.log({descriptions});
                    for (const modelPath in descriptions) {
                        if (Object.hasOwnProperty.call(descriptions, modelPath)) {
                            $('select').append(_('option', ['value:' + modelPath], modelPath.toUpperCase()));
                            console.log({modelPath});
                        }
                    }

                });
                this.when('error', (error) => {
                    alert(error);
                });

                this.descriptions = await SQuery.getDesriptions();

            }
        }
    }
}
Components.EntryPoint = EntryPoint;