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

import '../pageProfile/pageProfile.js';
import '../pageStatistic/pageStatistic.js';
import '../pageSwitchLogin/pageSwitchLogin.js';
import '../pageTrafic/pageTrafic.js';
import '../dashManager/dashManager.js';
import '../pageCreateUser/pageCreateUser.js';
import '../pageAgenda/pageAgenda.js';
import '../pageSingupUser/pageSingupUser.js';

export default class Home extends BaseComponent {
  constructor() {
    super({
      connect: false
    }, {});
    const { _, viewName, $, $All } = this.mvc;
    this.view = _(
      "div", viewName,
      _('div@mainpage', 'main',

        _(
          "div", "top-bar",
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
            "div", "home-profile",
            _("div@Login", "connexion", "Login ", _("div", "icon")),
            _("div@Signup", "inscription", "Signup", _("div", "icon"))
          )
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
        this.emit("@menu:click", $(".label.welcome"));
        $('.page-switch-login').component.when('success', (data) => {
          const dash = _('DashManager@mainpage',data);
          this.view.append(dash);
          this.emit('@mainpage:change',dash);
        })
        this.emit('@mainpage:change',$('.main'));
        // console.log(document.cookie);
       // $('.page-switch-login').component.emit('success')
      },
    };
  }
}

const home = new Home();
document.body.append(home.view);
