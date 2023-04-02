import { load } from "../../p.js";
import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';
import SQuery from "../../ts_lib/SQueryClient.js";
export class Login extends BaseComponent {
    constructor(data) {
        super({
            type: 'user'
        }, data);
        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,
            _('h1', 'title', 'LOGIN'),
            _('select@type', 'type',
                _('option', ['value:user'], 'User'),
                _('option', ['value:superadmin'], 'Admin'),
                _('option', ['value:manager'], 'Manager'),
                _('option', ['value:entreprisemanager'], 'Entreprise Manager'),
            ),
            _('div', 'input-ctn',
                _('input', ['type:text', 'class:email', 'placeholder:email']),
                _('input', ['type:text', 'class:password', 'placeholder:password'])
            ),
            _('div@submit', 'submit', 'SUBMIT'),
        );

        this.controller = {
            ['@type:change']: (select) => {
                this.type = select.value;
            },
            ['@submit:click']: async () => {
                const data = {};
                $All('input').forEach((input) => {
                    data[input.className] = input.value;
                })
                console.log("login:" + this.type,data);
                SQuery.emit("login:" + this.type, data, res => {
                    if (res.error) return this.emit('error', JSON.stringify(res));
                    this.emit('success', {
                        modelPath: 'account',//this.type,
                        id: res.response.loginId,
                    })
                });
            },
            [viewName]: () => {
                this.when('error', (error) => {
                    alert(error);
                });
                for (const key in load['login']) {
                    if (Object.hasOwnProperty.call(load['login'], key)) {
                        $('.' + key).value = load['login'][key];
                    }
                }
            }
        }
    }
}
Components.Login = Login;