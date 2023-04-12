import SQuery from "../../ts_lib/SQueryClient.js";
import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";

export default class Item extends BaseComponent {

    constructor(data) {
        super({
            modePath: '',
            id: '',
            instance: null,
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
            ['.date']: async (date) => {

                user.when('refresh:createdAt', (createdAt) => {
                    const d = new Date(date);
                    $('.date-label').textContent = d.toLocaleDateString()
                    const t = d.toLocaleTimeString();
                    $('.time-label').textContent = t.substring(0, t.lastIndexOf(':'))
                })
            },
            ['.name']: async (nameElem) => {

                const account = await (await this.getInstance())['account']
                account.when('refresh:name', name => {
                    nameElem.textContent = name;
                })
            },
            ['.status']: async (statusElem) => {
                const account = await (await this.getInstance())['account']
                account.when('refresh:status', status => {
                    $(statusElem, '.label').textContent = status;
                })
            },
            ['.phone']: async (phoneElem) => {
                const account = await (await this.getInstance())['account']
                account.when('refresh:phone', phone => {
                    phoneElem.textContent = phone;
                })
            },
            ['.img-profile']: async (imgProfile_v) => {
                const profile = await (await this.getInstance())['./account/profile']
                profile.when('refresh:imgProfile', imgProfile => {
                    imgProfile_v.style.background = 'no-repeat center/60% url(' + imgProfile + '.png)';
                })
            },
            ['@img:mouseover']: (imgProfile_v) => {
                imgProfile_v.style.background = 'no-repeat center/contain url(' + this.imgProfile + '.gif)';
            },
            ['@img:mouseout']: (imgProfile_v) => {
                imgProfile_v.style.background = 'no-repeat center/60% url(' + this.imgProfile + '.png)';
            },
            ['.building']: async (buildingElem) => {
                const address = await (await this.getInstance())['./account/address'];
                const building = await address['building'];
                building.when('refresh:name', name => {
                    buildingElem.textContent = name;
                })
            },
            ['.city']: async (cityElem) => {
                const address = await (await this.getInstance())['./account/address'];
                address.when('refresh:city', city => {
                    cityElem.textContent = city;
                })
            },
            [viewName]: async () => {

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
    async getInstance() {
        if (this.instance) return this.instance;
        const model = await SQuery.Model(this.modePath);
        return this.instance = await model.newInstance({ id: this.id })
    }
}
Components.Item = Item;
