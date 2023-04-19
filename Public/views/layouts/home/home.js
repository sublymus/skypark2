import BaseComponent from '../../ts_lib/baseComponent/baseComponent.js';
import '../creationPage/creationPage.js';
import '../deep/deep2.js';
import '../entryPoint/entryPoint.js';
import '../list/list.js';
import '../login/login.js';
import '../servicePage/servicePage.js';
import '../signup/signup.js';
import '../welcome/welcome.js';


export class Home extends BaseComponent {
    constructor() {
        super();

        const { _, $, $All, viewName } = this.mvc;
        this.view = _('div', viewName,
            _('div', 'top-bar',
                _('div', 'logo',
                    _('div', 'icon'),
                    _('h1', 'label', 'WENA.UI')
                ),
                _('div', 'onglet',
                    _('div@btn=welcome', 'btn', 'WELCOME'),
                    _('div@btn=signup', 'btn', 'SIGNUP'),
                    _('div@btn=login', 'btn', 'LOGIN'),
                    _('div@btn=entry-point', 'btn', 'ENTRY POINT'),
                    _('div@btn=creation-page', 'btn', 'Creation'),
                    _('div@btn=service-page', 'btn', 'Service'),
                    _('div@btn=deep-ctn', 'btn', 'DEEP'),
                )
            ),
            _('div', 'page-ctn',
                _('Welcome@page', {}),
                _('Login@page', {}),
                _('Signup@page', {}),
                _('EntryPoint@page', {}),
                _('CreationPage@page', {}),
                _('ServicePage@page', {}),
                _('div@page', 'deep-ctn'),
            )
        );

        this.controller = {
            ['@btn:click']: (btn, isSelected, e) => {
                if (isSelected) {
                    this.emit('@page:change', $('.' + e.value))
                }
            },
            ['@page:change']: (page, isSelected) => {
                if (isSelected) {
                    page.style.display = 'flex';
                } else {
                    page.style.display = 'none';
                }
            },
            [viewName]: (view) => {
                //{modelPath , id}
                $('.login').component.when('success', (data) => {
                    this.emit('createDeep', data);
                    this.emit('@page:change', $('.deep-ctn'))
                });
                $('.signup').component.when('success', (data) => {
                    this.emit('createDeep', data);
                    this.emit('@page:change', $('.deep-ctn'))
                });
                $('.entry-point').component.when('next', (data) => {
                    this.emit('createDeep', data);
                    this.emit('@page:change', $('.deep-ctn'))
                });
                $('.creation-page').component.when('next', (data) => {
                    this.emit('createDeep', data);
                    this.emit('@page:change', $('.deep-ctn'))
                });
                this.emit('@page:change', $('.login'))
                this.when('createDeep', ({ id, modelPath }) => {
                    $('.deep-ctn').childNodes.forEach(deepElem => {
                        deepElem.remove();
                    });
                    $('.deep-ctn').childNodes.forEach(deepElem => {
                        deepElem.remove();
                    });
                    $('.deep-ctn').append(_('Deep', {
                        id,
                        modelPath,
                        container: $('.deep-ctn'),
                    }));
                })
            }
        }
    }
}
document.body.append(new Home().view);