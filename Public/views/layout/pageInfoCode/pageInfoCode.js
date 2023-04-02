import BaseComponent, {
  Components
} from "../../ts_lib/baseComponent/baseComponent.js";
import SQuery from "../../ts_lib/SQueryClient.js";

const socket = SQuery.socket;
export default class PageInfoCode extends BaseComponent {
  constructor(data) {
    super(
      {
        parent: null,
        loadingIcon: "/img/search.gif",
        leftLabel: "back",
        rightLabel: "confirm",
        code: "",
        inputsData: {},
      },
      data
    );
    const { _, viewName, $, $All } = this.mvc;
    this.view = _(
      "div",
      viewName,
      _("h1", "title", "Confirmation"),
      _("div", "message", "enter confirmation code"),
      _(
        "div",
        "input-ctn",
        _("InputUi", {
          type: "number",
          icon: "confirm-code",
          hint: "Email code",
          name: "code",
        })
        //('InputUi', { type: 'number', icon: 'code', hint: 'Message Code', name: 'name' }),
      )
    );
    this.controller = {
      [viewName]: (view) => {

        this.when("back", (cb) => {
          $('input[name^="code"]').value = "";
          cb();
        });
        this.when("confirm", (cb) => {
          this.inputsData.codeCb({
            code: $('input[name^="code"]').value, createCallBack_p: (data) => {
              if (data.error) {
                alert(data.message)
                return this.parent.emit('@left:click', $(this.parent.view, 'left-button'))
              };
              ////console.log("** all ok **", { data });
              cb(data);
            }
          })

        });
      },
    };
  }
}

Components.PageInfoCode = PageInfoCode;
