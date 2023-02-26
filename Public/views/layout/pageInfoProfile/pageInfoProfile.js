import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";

export default class PageInfoProfile extends BaseComponent {

    constructor(data) {
        super({
            loadingIcon:'/img/email.gif',
            leftLabel:'',
            rightLabel:'finish',
            inputsData: {}
        }, data)

        const { _, viewName, $, $All } = this.mvc;
        this.view = _('div', viewName,
            _('h1', 'title', 'Profile Info'),
            _('div', 'message', 'Post your best photo to sublime your profile'),
            _('div', 'input-ctn',
                _('InputUi', { type: 'file', icon: 'user2', hint: 'Profile photo', name: 'img-profile' }),
                _('InputUi', { type: 'file', icon: 'image', hint: 'Banner picture', name: 'banner' }),
                _('InputUi', { type: 'text', icon: 'signature', hint: 'Message', name: 'message' }),
            ),
            
        );
        this.controller = {
            [viewName]: (view) => {
                this.when('get_data',(cb)=>{
                    const data = {
                        name: $('input[name^="img-profile"]').value,
                        email: $('input[name^="banner"]').value,
                        phone: $('input[name^="message"]').value,
                    };
                    this.data = data;
                    cb(data)
                });
                this.when('finish',(cb)=>{
                    this.emit('get_data', (data)=>{
                        /////// inpute validator
                        /////// send to server
                        /////// then All Ok
                        console.log(data);
                        cb(data)
                    })
                })
            },
        }
    }
}

Components.PageInfoProfile = PageInfoProfile;
