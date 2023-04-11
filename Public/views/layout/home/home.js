import BaseComponent from "../../ts_lib/baseComponent/baseComponent.js";
import "../contentWelcome/contentWelcome.js";
import "../page404/page404.js";
import "../pageBlog/pageBlog.js";
import "../pageBuilding/pageBuilding.js";
import "../pageCompagnie/pageCompagnie.js";
import "../pageForum/pageForum.js";
import "../Pagewelcome/pageWelcome.js";

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

import SQuery from "../../ts_lib/SQueryClient.js";
import '../dashManager/dashManager.js';
import '../pageAgenda/pageAgenda.js';
import '../pageCreateUser/pageCreateUser.js';
import '../pageProfile/pageProfile.js';
import '../pageSingupUser/pageSingupUser.js';
import '../pageStatistic/pageStatistic.js';
import '../pageSwitchLogin/pageSwitchLogin.js';
import '../pageTrafic/pageTrafic.js';

export default class Home extends BaseComponent {
  constructor() {
    super({
      connect: false
    }, {});
    const { _, viewName, $, $All } = this.mvc;
    this.view = _(
      "div", viewName,
      _('div@mainpage', 'main',

        _("div", "top-bar",
          _(
            "div", "home-logo",
            _("div", "icon"),
            _("div@menu=welcome", "label welcome", "Skypark")
          ),
          _(
            "div", "home-onglet",
            _(
              "div@menu=building", "building",
              _("div", "icon"),
              _("div", "label", "Building")
            ),
            _(
              "div@menu=compagnie", "compagnie",
              _("div", "icon"),
              _("div", "label", "Compagnie")
            ),
            _(
              "div@menu=blog", "blog",
              _("div", "icon"),
              _("div", "label", "Blog")
            ),
            _(
              "div@menu=forum", "forum",
              _("div", "icon"),
              _("div", "label", "Forum")
            )
          ),
          _(
            "div", "home-profile")
        ),
        _(
          "div", "page-container",
          _("PageForum@page", {}, _("Page404", {})),
          _("PageWelcome@page", {}, _("ContentWelcome", {})),
          _("PageBlog@page", {}, _("Page404", {})),
          _("PageCompagnie@page", {}, _("Page404", {})),
          _("PageBuilding@page", {}, _("Page404", {})),
        ),
      ),
      _('PageSwitchLogin', {}),
    );
    this.controller = {
      [".home-profile"]: async (div) => {
        const currentUser = await SQuery.CurrentUserInstance();
        if (!currentUser) {
          div.append(
            _("div@Login", "connexion", "Login ", _("div", "icon")),
            _("div@Signup", "inscription", "Signup", _("div", "icon"))
          )
        } else {
          this.emit("user-connected", "");
        }

      },
      ["@ert:click"]: (label) => {
        label.style.background = "#fff111";
      },
      ["@menu:click"]: (elem, isSelected, e) => {
        if (isSelected) {
          elem.classList.add("active");
          this.emit("@page:change", $(".page-" + e.value));
        } else {
          elem.classList.remove("active");
        }
      },
      ["@Login:click"]: (login) => {
        $('.page-switch-login').component.emit('start', 'login')
      },
      ["@Signup:click"]: (signup) => {
        $('.page-switch-login').component.emit('start', 'signup')
      },
      ["@page:change"]: (page, isSelected, e) => {
        if (isSelected) {
          page.style.display = "flex";
        } else {
          page.style.display = "none";
        }
      },
      ["@mainpage:change"]: (page, isSelected, e) => {
        if (isSelected) {
          page.style.display = "flex";
        } else {
          page.style.display = "none";
        }
      },
      [viewName]: (page, all) => {
        this.when('user-connected', async () => {
          $(".home-profile .connexion")?.remove();
          $(".home-profile .inscription")?.remove();
          const currentUser = await SQuery.CurrentUserInstance();
          const account = await currentUser['account'];
          const profile = await account['profile'];
          const imgProfile = await profile['imgProfile'];
          const name = await account['name'];
          $('.home-profile').append(
            _('div', 'name', name),
            _('div', 'icon'),
            _('div', 'dash', 'Dashboard')
          )
          const icon = $($('.home-profile'), '.icon');
          const dash = $($('.home-profile'), '.dash');
          dash.addEventListener('click', () => {
            const dash = _('DashManager@mainpage', {
              modelPath: currentUser.$modelPath,
              id: currentUser.$id,
            });
            this.view.append(dash);
            this.emit('@mainpage:change', dash);
          })
          icon.style.background = "no-repeat center/contain url('" + (imgProfile[0] || '/img/user.png') + "')";
          console.log(icon, imgProfile[0]);
        })
        this.emit("@menu:click", $(".label.welcome"));
        $('.page-switch-login').component.when('success', () => {
          this.emit("user-connected", "");
        })
        this.emit('@mainpage:change', $('.main'));
        // //console.log(document.cookie);
        // $('.page-switch-login').component.emit('success')
      },
    };
  }
}

const home = new Home();
document.body.append(home.view);
