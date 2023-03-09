import { load } from "../../p.js";
import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
import SQuery from "../../ts_lib/SQueryClient.js";

export class Signup extends BaseComponent {
    constructor(data) {
        super({
            type: 'user',
        }, data);
        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,
            _('h1', 'title', 'SIGNUP'),
            _('select@type', 'type',
                _('option', ['value:user'], 'User'),
                _('option', ['value:admin'], 'Admin'),
                _('option', ['value:manager'], 'Manager'),
                _('option', ['value:compagny'], 'Compagny'),
            ),
            _('div', 'input-ctn',
                _('textarea', ['rows:100', 'cols:450'])
            ),
            _('div@submit', 'submit', 'SUBMIT'),
        );

        this.controller = {
            ['@type:change']: (select) => {
                this.type = select.value;
            },
            ['@submit:click']: () => {
                try {
                    const data =  JSON.parse($('textarea').value)
                    if (SQuery.socket.connected) {
                        SQuery.socket.emit(this.type,{__action:'create',...data}, res => {
                            if (res.error) return this.emit('error', JSON.stringify(res));
                            this.emit('success', {
                                modelPath: this.type,
                                id: res.response,
                            })
                        });
                    }
                } catch (error) {
                    alert(error)
                }
            },
            [viewName]: (view) => {
                this.when('error', (error) => {
                    alert(error);
                });
                this.when('type', (type) => {
                    console.log('wertyui');
                    const data = load[type]?.['create']
                    if (!data) return $('textarea').value = 'Type <' + type + '> Undefined';
                    $('textarea').value = JSON.stringify(data).split('').map((c) => {
                        return c == '}' ? '\n}' : (c == '{' ? '{\n' : (c == ',' ? ',\n' : c))
                    }).join('');
                })
            }
        }
    }
}
Components.Signup = Signup;