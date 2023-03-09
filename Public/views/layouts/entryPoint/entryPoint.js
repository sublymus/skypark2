import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';

export class EntryPoint extends BaseComponent {
    constructor(data) {
        super({
            model: 'user',
            models: {
                user: {},
                account: {}
            }
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
            [viewName]: () => {
                this.when('models', (models) => {
                    $('select').childNodes.forEach(option => {
                        option.remove();
                    });
                    for (const modelPath in models) {
                        if (Object.hasOwnProperty.call(models, modelPath)) {
                            $('select').append(_('option',['value:'+modelPath], modelPath.toUpperCase()));
                        }
                    }

                });
                this.when('error', (error) => {
                    alert(error);
                });

            }
        }
    }
}
Components.EntryPoint = EntryPoint;