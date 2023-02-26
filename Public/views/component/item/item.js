import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";

export default class Item extends BaseComponent {

    constructor(data) {
        super({
            createdDate: Date.now() - 1_000_000_000 + parseInt(Math.random() * 1_000_000_000),
            name: '',
            building: '',
            imgProfile: '',
            bainner: '',
            phone: '',
            city: '',
            status: '',
            room: '',
            etage: '',
            door: '',
        }, data)

        const { _, viewName, $, $All } = this.mvc;

        this.view = _('div', viewName,
            _('div', 'date',
                _('div', 'date-label'),
                _('div', 'time-label')
            ),
            _('div', 'profile',
                _('div@img', 'img-profile'),
                _('div', 'info-ctn',
                    _('div', 'name'),
                    _('div', 'location-info',
                        _('div', 'building'),
                        _('div', 'city')
                    )
                )
            ),
            _('div', 'status', _('span', 'label')),
            _('div', 'phone'),
        );
        this.controller = {
            ['.date']: (date) => {
                this.when('createdDate', date => {
                    const d = new Date(date);
                    $('.date-label').textContent = d.toLocaleDateString()
                    const t = d.toLocaleTimeString();
                    $('.time-label').textContent = t.substring(0, t.lastIndexOf(':'))
                })
            },
            ['.name']: (nameElem) => {
                this.when('name', name => {
                    nameElem.textContent = name;
                })
            },
            ['.status']: (statusElem) => {
                this.when('status', status => {
                    $(statusElem, '.label').textContent = status;
                })
            },
            ['.phone']: (phoneElem) => {
                this.when('phone', phone => {
                    phoneElem.textContent = phone;
                })
            },
            ['.img-profile']: (imgProfile_v) => {
                this.when('imgProfile', imgProfile => {
                    imgProfile_v.style.background = 'no-repeat center/60% url(' + imgProfile + '.png)';
                })
            },
            ['@img:mouseover']: (imgProfile_v) => {
                imgProfile_v.style.background = 'no-repeat center/contain url(' + this.imgProfile + '.gif)';
            },
            ['@img:mouseout']: (imgProfile_v) => {
                imgProfile_v.style.background = 'no-repeat center/60% url(' + this.imgProfile + '.png)';
            },
            ['.phone']: (phoneElem) => {
                this.when('phone', phone => {
                    phoneElem.textContent = phone;
                })
            },
            ['.building']: (buildingElem) => {
                this.when('building', building => {
                    buildingElem.textContent = building;
                })
            },
            ['.city']: (cityElem) => {
                this.when('city', city => {
                    cityElem.textContent = city;
                })
            },
            [viewName]: () => {
                this.when('mouseout', isSelected => {
                    this.view.classList.remove('over')
                })
                this.when('mouseover', isSelected => {
                    if (isSelected) {
                        this.view.classList.add('over')
                    }
                })
                this.when('click', isSelected => {
                    if (isSelected) {
                        this.view.classList.add('active')
                    } else {
                        this.view.classList.remove('active')
                    }
                })
            }
        }
    }
}
Components.Item = Item;
