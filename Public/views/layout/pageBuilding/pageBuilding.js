import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";
export default class PageBuilding extends BaseComponent {

    constructor(data1) {
        super({  childrens: []    })
           const { _, viewName, $, $All } = this.mvc;

        this.view = _('div', viewName);
        this.controller = { }
    }
}

Components.PageBuilding = PageBuilding;
