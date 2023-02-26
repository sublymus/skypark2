import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";

export default class PageAgenda extends BaseComponent {

    constructor(data) {
        super({
           // name: 'Agenda'
        }, data)

        const { _, viewName, $, $All } = this.mvc;

        this.view = _('div', viewName,

        );
        this.controller = {
            ['@g:e']: (o, onglets) => {

            },
            [viewName]: () => {
                this.when('page', page => {
                    
                })
            }
        }
    }
}

Components.PageAgenda = PageAgenda;
