import BaseComponent, {
  Components
} from "../../ts_lib/baseComponent/baseComponent.js";
import SQuery from "../../ts_lib/SQueryClient.js";

const socket = SQuery.socket;
export default class PageInfoPerso extends BaseComponent {
  constructor(data) {
    super(
      {

        loadingIcon: "/img/email.gif",
        leftLabel: "",
        rightLabel: "next",
        inputsData: {},
        authData: {},
      },
      data
    );

    const { _, viewName, $, $All } = this.mvc;
    this.view = _(
      "div",
      viewName,
      _("h1", "title", "Create Account"),
      _("div", "auth-list"),
      _("div", "message", "or use your email for registration"),
      _(
        "div",
        "input-ctn",
        _("InputUi", {
          type: "text",
          icon: "user2",
          hint: "Name",
          name: "name",
          value:'ertyu'
        }),
        _("InputUi", {
          type: "email",
          icon: "email",
          hint: "Email",
          name: "email",
          value:'sublymus@gmail.com'
        }),
        _("InputUi", {
          type: "text",
          icon: "phone",
          hint: "Telephone",
          name: "telephone",
          value:"123456789"
        }),
        _("InputUi", {
          type: "password",
          icon: "padlock",
          hint: "Password",
          name: "password",
          value:"piou"
        }),
        _("InputUi", {
          type: "password",
          icon: "padlock",
          hint: "Password",
          name: "password2",
          value:'piou'
        }),
        _("InputUi", {
          type: "password",
          icon: "building",
          hint: "company",
          name: "company",
        })
      )
    );
    this.controller = {
      [viewName]: (view) => {
        let nextCallBack = null;
        let createCallBack = null;
        this.when("next", (cb) => {
          nextCallBack = cb;
          const account = {};
          $All('input').forEach((input) => {
            console.log(input);
            account[input.name] = input.value;
          })
          console.log({ account });
          SQuery.emit("signup:user", { account }, (res) => {
            console.log(res);

            if (res.error) return createCallBack?.({
              error: res.error
            });

            createCallBack?.({
              modelPath: 'user',
              id: res.response,
            });
          });

        });
        SQuery.on("signup:user/config", (data, codeCb) => {
          nextCallBack({
            ...data, codeCb: ({ code, createCallBack_p }) => {
              codeCb(code);
              createCallBack = createCallBack_p;
            }
          })
        });
      },
    };
  }
}

Components.PageInfoPerso = PageInfoPerso;
