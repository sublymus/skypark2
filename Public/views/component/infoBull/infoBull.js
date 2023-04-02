import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";
export default class InfoBull extends BaseComponent {

    constructor(data) {
        super({
            item: null,
            size: 2,
            erty: 'f'
        })

        const { _, viewName, $, $All } = this.mvc;

        this.view = _('div', viewName,
            _('div', 'top-bar',
                _('div@exite', 'exite icon'),
                _('div@resize', 'resize icon'),
                _('div@down', 'down icon'),
                _('div@up', 'up icon'),
                _('div@option', 'option icon'),
            ),
            _('div', 'bainner',
                _('div', 'img-profile'),
            ),
            _('div', 'location-info',
                _('div', 'building'),
                _('div', 'city')
            ),
            _('div', 'name'),
            _('div', 'min-info',
                _('div', 'status',
                    _('span', 'value')
                ),
                _('div', 'phone'),
            ),
            _('div', 'menu-bar',
                _('div@menu=description', 'profile menu', 'Profile'),
                _('div@menu=messenger', 'messenger menu', 'Messenger'),
                _('div@menu=history', 'historique menu', 'Historique'),
                _('div@menu=setting', 'setting menu', 'Setting'),
            ),
            _('div@page', 'page-setting', _('Page404', {})),
            _('div@page', 'page-history', _('Page404', {})),
            _('div@page', 'page-messenger', _('Page404', {})),
            _('div@page', 'page-description',
                _('div', 'status',
                    _('div', 'icon'),
                    _('div', 'label', 'Status'),
                    _('div', 'value'),
                ),
                _('div', 'name',
                    _('div', 'icon'),
                    _('div', 'label', 'Name'),
                    _('div', 'value'),
                ),
                _('div', 'phone',
                    _('div', 'icon'),
                    _('div', 'label', 'Telephone'),
                    _('div', 'value'),
                ),
                _('div', 'city',
                    _('div', 'icon'),
                    _('div', 'label', 'City'),
                    _('div', 'value'),
                ),
                _('div', 'building',
                    _('div', 'icon'),
                    _('div', 'label', 'Building'),
                    _('div', 'value'),
                ),
                _('div', 'door',
                    _('div', 'icon'),
                    _('div', 'label', 'Door'),
                    _('div', 'value'),
                ),
                _('div', 'etage',
                    _('div', 'icon'),
                    _('div', 'label', 'Etage'),
                    _('div', 'value'),
                ),
                _('div', 'room',
                    _('div', 'icon'),
                    _('div', 'label', 'Room'),
                    _('div', 'value'),
                ),
                _('div', 'created-date',
                    _('div', 'icon'),
                    _('div', 'label', 'Creation date'),
                    _('div', 'value'),
                ),
            )
        );
        this.controller = {

            ['@menu:click']: (menu, isSelected, e) => {
                if (isSelected) {
                    menu.classList.add('active');
                    this.emit('@page:change', $('.page-' + e.value))
                } else {
                    menu.classList.remove('active');
                }
            },

            ['@page:change']: (page, isSelected) => {
                if (isSelected) {
                    page.style.display = "flex";
                } else {
                    page.style.display = "none";
                }
            },
            ['@down:click']: (exite) => {
                this.size--;
                this.view.className = 'info-bull';
                this.view.classList.add('size' + this.size)
            },
            ['@up:click']: (exite) => {
                this.size++;
                this.view.className = 'info-bull';
                this.view.classList.add('size' + this.size)
            },
            ['@resize:click']: (exite) => {
                this.view.className = 'info-bull';
                this.view.classList.add('size' + this.size)
            },
            ['@exite:click']: (exite) => {
                this.view.className = 'info-bull';
                this.view.classList.add('exite')
            },
            ['@option:click']: (exite) => {
                //this.view.classList.add('exite')
            },
            [viewName]: (view) => {
                this.emit('@page:change', $('.page-description'))
                this.when('size', v => {
                    const val = v < 0 ? 0 : (v > 2 ? 2 : v)
                    this.size = this.size != val ? val : this.size;
                }, true)
                this.when('item', (item) => {
                    //console.log(item);
                    if (!item) return;
                    $('.location-info > .building').textContent = item.building
                    $('.info-bull > .name ').textContent = item.name
                    $('.info-bull .status .value').textContent = item.status
                    $(' .info-bull .min-info .phone').textContent = item.phone
                    $('.page-description .status .value').textContent = item.status
                    $('.page-description .name .value').textContent = item.name
                    $('.page-description .phone .value').textContent = item.phone
                    $('.page-description .city .value').textContent = item.city
                    $('.page-description .building .value').textContent = item.building
                    $('.page-description .door .value').textContent = item.door
                    $('.page-description .etage .value').textContent = item.etage
                    $('.page-description .room .value').textContent = item.room
                    $('.info-bull >.bainner').style.background = 'no-repeat center/cover url(' + (item.bainner || '/img/bainner.png') + ')';
                    $('.info-bull .img-profile').style.background = 'no-repeat center/contain url(' + (item.imgProfile + ".png" || '/img/user.png') + '),#345';
                    $('.info-bull .created-date .value').textContent = new Date(item.createdDate).toLocaleDateString();
                })
            }
        }
    }
}

Components.InfoBull = InfoBull;
