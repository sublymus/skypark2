import BaseComponent, { Components } from "../../ts_lib/baseComponent/baseComponent.js";
import SQuery from "../../ts_lib/SQueryClient.js";

export default class PageInfoProfile extends BaseComponent {

    constructor(data) {
        super({
            loadingIcon: '/img/email.gif',
            leftLabel: '',
            rightLabel: 'finish',
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

                this.when('finish', async (cb) => {
                    const model = await SQuery.Model(this.inputsData.modelPath);
                    const user = await model.newInstance({id:this.inputsData.id});
                    const account = await user['account'];
                    const profile = await account['profile']

                    profile['imgProfile'] = $('input[name^="img-profile"]').files;
                    profile['banner'] = $('input[name^="banner"]').files;
                    profile['message'] = $('input[name^="message"]').value;
                    cb(this.inputsData);
                })
            },
        }
    }
}

Components.PageInfoProfile = PageInfoProfile;
