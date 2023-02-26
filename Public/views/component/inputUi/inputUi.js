import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";

export default class InputUi extends BaseComponent {

    constructor(data) {
        super({
            type: 'text',
            hint: '',
            icon: null,
            name: 'input'
        }, data)

        const { _, viewName, $, $All } = this.mvc;

        this.view =_('div', viewName,
        _('div', 'icon'),
        _('input'),
        _('div', 'eye'),
    );
        this.controller = {
            ['.icon']: (elem) => {
                this.when('icon', (icon) => {
                    if (icon == null) {
                        $('.icon').display = 'none';
                    } else {
                        $('.icon').display = 'block';
                        $('.icon').style.background = `no-repeat center/contain url('/img/${icon}.png')`;
                    }
                });
            },
            ['input']: (input) => {

                this.when('name', (name) => {
                    input.name = name;
                });
                this.when('type', (type) => {
                    input.type = type;
                    if (type == 'password') {
                        $('.eye').display = 'block';
                    } else {
                        $('.eye').display = 'none';
                    }
                });
                this.when('hint', (hint) => {
                    input.placeholder = hint;
                });
            },
            ['.eye']: (elem) => {
                $('.eye').addEventListener('click', () => {
                   // $('input').type = $('input').type == 'password' ? 'text' : 'password';
                });

            }
        }
    }
}
Components.InputUi = InputUi;


