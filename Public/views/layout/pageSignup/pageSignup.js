import Anim from "../../ts_lib/anim/Anim.js";
import BaseComponent, {
  Components
} from "../../ts_lib/baseComponent/baseComponent.js";

export default class PageSignup extends BaseComponent {
  constructor(data) {
    super(
      {
        org: "SkyPark",
        selectedIndex: 0,
        authList: {},
      },
      data
    );
    const { _, viewName, $, $All } = this.mvc;
    const pages = [
      _("PageInfoPerso@page", { parent: this }),
      _("PageInfoCode@page", { parent: this }),
      _("PageInfoProfile@page", { parent: this }),
      _("PageInfoSuccess@page", { parent: this }),
    ];

    this.view = _(
      "div",
      viewName,
      _("div", "page-ctn", ...pages),
      _(
        "div",
        "btn-ctn",
        _("div@left", "left-button"),
        _("div@right", "right-button")
      ),
      _("div", "loading", _("div", "icon"))
    );

    let w = 0;
    const backAnim = new Anim({
      duration: 300,
    })
      .when("start startReverse", () => {
        w = this.view.getBoundingClientRect().width;
      })
      .when("progress", (p) => {
        if (pages[this.selectedIndex + 1])
          pages[this.selectedIndex + 1].style.transform = `translateX(${p * w
            }px)`;
        pages[this.selectedIndex].classList.add("active");
        pages[this.selectedIndex].style.transform = `translateX(${-(1 - p) * w
          }px)`;
      })
      .when("onEnd", () => {
        if (pages[this.selectedIndex + 1])
          pages[this.selectedIndex + 1].classList.remove("active");
      });
    const nextAnim = new Anim({
      duration: 300,
    })
      .when("start startReverse", () => {
        w = this.view.getBoundingClientRect().width;
      }).when("progress", (p) => {
        const a = 100;
        pages[this.selectedIndex].classList.add("active");
        pages[this.selectedIndex].style.transform = `translateX(${(1 - p) * (w + a) - a}px)`;
        if (pages[this.selectedIndex - 1])
          pages[this.selectedIndex - 1].style.transform = `translateX(${-p * w}px)`;
      }).when("onEnd", () => {
        if (pages[this.selectedIndex - 1])
          pages[this.selectedIndex - 1].classList.remove("active");
      });

    this.controller = {
      ["@page:change"]: (page, isSelected) => {
        if (isSelected) {
          $(".btn-ctn").style.display = "flex";
          $(".loading").style.display = "none";
          if (page.component.loadingIcon)
            $(".loading").style.background = `no-repeat center/contain url(${page.component.loadingIcon})`;
          if (page.component.leftLabel) {
            $(".left-button").style.display = "block";
            $(".left-button").textContent = page.component.leftLabel.toUpperCase();
          } else {
            $(".left-button").style.display = "none";
          }
          if (page.component.rightLabel) {
            $(".right-button").style.display = "block";
            $(".right-button").textContent =
              page.component.rightLabel.toUpperCase();
          } else {
            $(".right-button").style.display = "none";
          }
          //page.
        } else {
          //page.classList.remove('active')
        }
      },
      ["@left:click"]: (left) => {
        $(".btn-ctn").style.display = "none";
        $(".loading").style.display = "flex";
        pages[this.selectedIndex].component.emit(
          left.textContent.toLowerCase(),
          () => {
            backAnim.start();
            this.emit("@page:change", pages[--this.selectedIndex]);
          }
        );
      },
      ["@right:click"]: (right) => {
        $(".btn-ctn").style.display = "none";
        $(".loading").style.display = "flex";
        //  //console.log(this.selectedIndex);

        if (this.selectedIndex == 3) {
          this.emit("success", data);
          return this.emit("@page:change", pages[this.selectedIndex]);

        }

        ////////////////////////////////////////////////////////////////////////////////

        pages[this.selectedIndex].component.emit(right.textContent.toLowerCase(), (data_p) => {
          ////console.log({data});
          nextAnim.start();
          data = data_p;
          pages[this.selectedIndex + 1].component.inputsData = data;

          //if (this.selectedIndex == 1)
          // if (this.selectedIndex == 0)
          //   this.emit("success",data);

          this.emit("@page:change", pages[++this.selectedIndex]);
        }
        );
      },
      [viewName]: (view) => {
        // $(".page-info-profile").component.emit("");
        this.emit("@page:change", pages[this.selectedIndex]);
        nextAnim.emit("progress", 0);
      },
    };
  }
}

Components.PageSignup = PageSignup;
