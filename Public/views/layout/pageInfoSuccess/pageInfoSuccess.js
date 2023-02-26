import BaseComponent, {
  Components,
} from "../../ts_lib/baseComponent/baseComponent.js";
// import PageSwitchLogin from "../PageSwitchLogin/PageSwitchLogin.js";
export default class PageInfoSuccess extends BaseComponent {
  constructor(data) {
    super(
      {
        rightLabel: "done",
      },
      data
    );

    const { _, viewName, $, $All } = this.mvc;

    this.view = _(
      "div",
      viewName,
      _("div", "icon"),
      _("h1", "title", "SUCCESS"),
      _("div", "message", "Your Account Is Successfully Created")
    );
    this.controller = {
      [viewName]: (view) => {
        this.when("done", (cb) => {
          this.emit("get_data", (data) => {
            // setTimeout(() => {
            //   PageSwitchLogin().emit("cancel");
            // }, 2000);
    
            /////// inpute validator
            /////// send to server
            /////// then All Ok
            console.log(data);
            cb(data);
          });
        });
      },
    };
  }
}

Components.PageInfoSuccess = PageInfoSuccess;
