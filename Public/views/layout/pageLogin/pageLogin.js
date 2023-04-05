import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";
import SQuery from "../../ts_lib/SQueryClient.js";

export default class PageLogin extends BaseComponent {

    constructor(data) {
        super({
            signupModelPath: 'user',
            loginModelPath: 'account',
        }, data)

        const { _, viewName, $, $All } = this.mvc;

        this.view = _('div', viewName,
            _('h1', 'title', 'Sign in toSkypark'),
            _('div', 'auth-list'),
            _('div', 'message', 'or use your email for registration'),
            _('div', 'input-ctn',
                _('InputUi', { type: 'email', icon: 'email', hint: 'Email', name: 'email' }),
                _('InputUi', { type: 'password', icon: 'padlock', hint: 'Password', name: 'password' }),
            ),
            _('div', 'forget-btn', 'Forget your password?'),
            _('div', 'btn-ctn',
                _('div@submit', 'submit', 'LOGIN')
            )
        );
        this.controller = {
            ['h1.title']: (title) => {
                title.textContext = 'Sing in to ' + 'Skypark'
            },
            ['@submit:click']: (elem) => {
                const data = {};
                $All('input').forEach((input) => {
                    ////*console.log(input);
                    data[input.name] = input.value;
                })
                ////*console.log({data});
                SQuery.emit("login:" + this.signupModelPath, data, res => {
                    if (res.error) return this.emit('error', JSON.stringify(res));
                    this.emit('connected', {
                        modelPath: this.loginModelPath,//,
                        id: res.response.loginId,
                    })
                });
            },

        }
    }
}

Components.PageLogin = PageLogin;
