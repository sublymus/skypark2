import { load } from '../../p.js';
import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
import SQuery from '../../ts_lib/SQueryClient.js';

export class CreationPage extends BaseComponent {
    constructor(data) {
        super({
            modelPath: 'user',
            service: 'create',
        }, data);
        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,
            _('h1', 'title', 'Model-service'),
            _('input@modelInput', ['type:text', 'class:model-input', 'placeholder:model path']),
            _('div', 'input-ctn',
                _("textarea", ["rows:100", "cols:450"])
            ),
            _('div@create', 'create', 'Send'),
        );
        this.controller = {
            ['@modelInput:change']: (input) => {
                try {
                    if (input.value.includes('.')) {
                        const parts = input.value.split('.');
                        this.modelPath = parts[0];
                        this.service = parts[1];
                        //console.log('input.value : ', input.value, parts);
                    } else {
                        this.modelPath = input.value;
                        //console.log('input.value : ', input.value);
                    }
                    const data = this.service ? load[this.modelPath][this.service] : load[this.modelPath]
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
                    if (!(this.modelPath && this.service)) return this.emit('error', 'input is empty');
                    const Model = await SQuery.model(this.modelPath);
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
                $('.model-input').value = this.modelPath + '.' + this.service;
                this.emit('@modelInput:change', $('.model-input'))
                this.when('error', (error) => {
                    alert(error);
                });

            }
        }
    }
}
Components.CreationPage = CreationPage;

