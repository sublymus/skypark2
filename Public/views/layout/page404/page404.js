import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";

export default class Page404 extends BaseComponent {

    constructor(data) {
        super({
           // name: 'Agenda'
        }, data)
        // background-clip: text;
        // -webkit-background-clip: text;
        // color: transparent;
        const { _, viewName, $, $All } = this.mvc;
        this.view = _('div', viewName,
        _('h1','text404','404'),
        _('h3','title','Page Not Found'),
        _('p','message','The page you\'re looking does not seem to exist'),
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

Components.Page404 = Page404;
