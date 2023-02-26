import BaseComponent,{Components} from "../../ts_lib/baseComponent/baseComponent.js";

export default class PageStatistic extends BaseComponent {

    constructor() {
        super({
            name:'Statistic'
        })

        const { _, viewName, $, $All } = this.mvc;

        this.view = _('div', viewName,

        );
        this.controller = {
            ['.home-onglet > *']: (o, onglets) => {

            },
            [viewName]: () => {
                this.when('page', page => {

                })
            }
        }
    }
}

Components.PageStatistic = PageStatistic;