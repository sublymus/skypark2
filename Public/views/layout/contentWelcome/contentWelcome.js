import baseComponent, {
  Components
} from "../../ts_lib/baseComponent/baseComponent.js";

export default class ContentWelcome extends baseComponent {
  constructor(data1) {
    super({
      childrens: [],
      ok: true
    });
    const { _, viewName, $, $All } = this.mvc;

    this.view = _(
      "div@root",
      viewName,
      _(
        "div",
        "info",
        _(
          "div",
          "message",
          _("span", "", "Redécouvrez "),
          _("span", "", "vos voisins."),
          _(
            "span", "",
            "Connectez-vous avec vos voisins et découvrez votre communauté locale !"
          ), _("div", "interact", _("div", "btn-insc", "Creez votre compte"), _("div", "btn-explore", "Decouvrez nos partenaire"))
        ),
      ),
      _("div", "image")
    );
    this.controller = {
      ['@root:mousemove']: (root, isSelected, e) => {

        if (this.ok) {
          this.ok=false;
          let x = (e.event.clientX / window.innerWidth) - 0.5;
          x *= -50;
          let y = (e.event.clientY / window.innerHeight) - 0.5;
          y *= -50;
          $('.image').style.filter = `drop-shadow(${parseInt(x)}px ${parseInt(y)}px 10px #5396e7de)`;
          setTimeout(() => {
            this.ok=true;
          }, 0);
        }

      }
    };
  }
}

Components.ContentWelcome = ContentWelcome;
