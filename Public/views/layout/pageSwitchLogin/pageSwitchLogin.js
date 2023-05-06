import Anim from "../../ts_lib/anim/Anim.js";
import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";

export default class PageSwitchLogin extends BaseComponent {

    constructor(data) {
        super({
            seletedPage: null
        }, data)

        const { _, viewName, $, $All } = this.mvc;

        this.view = _('div', viewName,
            _('div', 'container',
                _('div', 'logo', _('div', 'icon')),
                _('div', 'prompt',
                    _('div', 'prompt-top',
                        _('div', 'prompt-login',
                            _('h1', 'title', 'Welcome Back!'),
                            _('h3', 'message', 'To keeep connected with us please login with your personal info')
                        ),
                        _('div', 'prompt-signup',
                            _('h1', 'title', 'You Are Welcome!!'),
                            _('h3', 'message', 'Enter your personnal details and start journey with us')
                        ),
                    ),
                    _('div@change', 'change', 'I WANT TO REGISTER')
                ),
                _('div', 'form-ctn')
            )
        );
        this.controller = {
            ['@page:change']: (page, isSelected, e) => {
                if (isSelected) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            },
            [viewName]: () => {
                // this.emit('@page:change', $('.page-login'))
                let Width = 0
                const anim = new Anim({
                    duration: 700
                }).when('start startReverse', (p) => {
                    //console.log(p);
                    Width = $('.container').getBoundingClientRect().width
                }).when('progress', (p) => {
                    $('.prompt').style.width = `${p * Math.sin(p * Math.PI) * 20 + 40}%`
                    $('.prompt').style.transform = `translateX(${p * Width * (1 - 0.4)}px)`
                    $('.form-ctn').style.transform = `translateX(${-p * Width * (1 - 0.6)}px)`
                    $('.prompt-login').style.transform = `translateX(${(1 - p) * Width * 0.8}px)`
                    $('.prompt-signup').style.transform = `translateX(${(-p) * Width * 0.8}px)`
                    $('.change').textContent = p < 0.5 ? 'I\'M  ALREADY REGISTERED' : 'I WANT TO REGISTER'
                    if (p < 0.5) this.emit('@page:change', $('.page-signup'));
                    else this.emit('@page:change', $('.page-login'))
                });

                this.when('@change:click', () => {
                    anim.toggle();
                })
                const successAnim = new Anim({
                    duration: 500
                }).when('progress', (p) => {
                    $('.prompt').style.transform = `translateX(${-p * Width * 0.4}px)`
                    $('.form-ctn').style.transform = `translateX(${-p * Width * (0.2)}px)`
                });
                const doneAnim = new Anim({
                    duration: 500
                }).when('progress', (p) => {
                    this.view.style.opacity = `${(1 - p)}`
                }).when('onEnd', () => {
                    this.view.style.display = 'none';
                })

                this.view.addEventListener('click', (e) => {
                    if (e.target == this.view) {
                        //console.log('trertyuiop');
                        this.emit('cancel')
                    }
                })

                this.when('cancel', () => {
                    doneAnim.start();
                })
                this.view.style.display = 'none';
                this.when('start', (service) => {
                    //console.log('qwertyuioiuytrewertyui');

                    $('.form-ctn').append(
                        _('PageLogin@page'),
                        _('PageSignup@page')
                    )
                    $('.page-signup').component.when('success', (data) => {
                        successAnim.toggle();
                        //console.log('&&&&&&&&&&',data);
                        this.emit('success', data);
                    })
                    $('.page-signup').component.when('done', () => {
                        doneAnim.start();
                    });
                    $('.page-login').component.when('connected', (data) => {
                        this.emit('success', data);
                        doneAnim.start();
                    })

                    this.view.style.display = 'flex';
                    this.view.style.opacity = '1'
                    let p = 0
                    if (service == 'login') {
                        anim.start()
                    } else {
                        anim.startReverse()
                    }

                })
            }
        }
    }
}
Components.PageSwitchLogin = PageSwitchLogin;
