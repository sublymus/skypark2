import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";

export default class PageLogin extends BaseComponent {

    constructor(data) {
        super({
            authList: {},
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
                _('div@submit', 'submit','LOGIN')
            )
        );
        this.controller = {
            ['h1.title']: (title) => {
                title.textContext = 'Sing in to ' + 'Skypark'
            },
            ['.submit-button']: (elem) => {

            },

        }
    }
}

Components.PageLogin = PageLogin;
