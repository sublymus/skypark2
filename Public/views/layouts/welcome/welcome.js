import BaseComponent, { Components } from '../../ts_lib/baseComponent/baseComponent.js';

export class Welcome extends BaseComponent {
    constructor() {
        super();
        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,
            
        );

        this.controller = {
            [viewName]: (view) => {
              
            }
        }
    }
}
Components.Welcome = Welcome;