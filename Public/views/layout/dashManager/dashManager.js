import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";

import '../pageInfoCode/pageInfoCode.js';
import '../pageInfoPerso/pageInfoPerso.js';
import '../pageInfoProfile/pageInfoProfile.js';
import '../pageInfoSuccess/pageInfoSuccess.js';
import '../pageLogin/pageLogin.js';
import '../pageSignup/pageSignup.js';
import '../pageSwitchLogin/pageSwitchLogin.js';

import '../../component/infoBull/infoBull.js';
import '../../component/inputUi/inputUi.js';
import '../../component/item/item.js';
import '../../component/itemList/itemList.js';

import '../page404/page404.js';
import '../pageProfile/pageProfile.js';
import '../pageStatistic/pageStatistic.js';
import '../pageSwitchLogin/pageSwitchLogin.js';
import '../pageTrafic/pageTrafic.js';

export default class DashManager extends BaseComponent {

    constructor() {
        super({
        }, {})

        const { _, viewName, $, $All } = this.mvc;

        this.view = _('div', viewName,
            _('div', 'top-bar',
                _('div', 'home-logo',
                    _('div', 'icon'),
                    _('div@ert', 'label', 'Skypark'),
                ),
                _('div', 'home-onglet',
                    _('div@menu=agenda', 'agenda',
                        _('div', 'icon'),
                        _('div', 'class:label', 'Support'),
                    ),
                    _('div@menu=trafic', 'trafic',
                        _('div', 'icon'),
                        _('div', 'label', 'Cient'),
                    ),
                    _('div@menu=statistic', 'statistic',
                        _('div', 'icon'),
                        _('div', 'label', 'Statistic'),
                    ),
                ),
                _('div@profile=profile', 'home-profile',
                    _('div', 'icon'),
                ),
            ),
            _('div', 'page-container',
                _('PageAgenda@page', {}, _('Page404', {})),
                _('PageTrafic@page', {}),
                _('PageStatistic@page', {}, _('Page404', {})),
                _('PageProfile@page', {}, _('Page404', {})),

            )
        );
        this.controller = {

            ['@ert:click']: (label) => {
                label.style.background = '#345'
            },
            ['@menu:click']: (elem, isSelected, e) => {

                if (isSelected) {
                    elem.classList.add('active')
                    this.emit('@page:changeBye', $('.page-' + e.value))
                } else {
                    elem.classList.remove('active')
                }
            },
            ['@profile:click']: (elem, isSelected, e) => {
                this.emit('@page:changeBye', $('.page-' + e.value))
            },
            ['@page:changeBye']: (page, isSelected, e) => {
                if (isSelected) {
                    page.style.display = 'flex';
                } else {
                    page.style.display = 'none';
                }
            },
            [viewName]: (page, all) => {
                //console.log($('.agenda'));
                this.emit('@page:changeBye', $('.page-trafic'))
            },
        }
    }
}
Components.DashManager = DashManager;