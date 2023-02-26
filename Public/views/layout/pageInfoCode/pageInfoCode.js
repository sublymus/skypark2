import BaseComponent, {
  Components,
} from "../../ts_lib/baseComponent/baseComponent.js";
import SQuery from "../../ts_lib/SQueryClient.js";

const socket = SQuery.socket;
export default class PageInfoCode extends BaseComponent {
  constructor(data) {
    super(
      {
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
        this.when("get_data", (cb) => {
          const data = {
            code: $('input[name^="code"]').value,
          };
          //   this.data = data;
          cb(data);
        });
        this.when("back", (cb) => {
          $('input[name^="code"]').value = "";
          cb();
        });
        this.when("confirm", (cb) => {
          this.emit("get_data", (data) => {
            // /////// input validator
            console.log({
              id: this.inputsData.response,
              email: this.inputsData.userEmail,
            });
            isValidateCode({
              input: this.inputsData,
              codeUser: undefined// data,
            }).then((resultat) => {
              if (resultat === true) {
                socket.emit("validcompt", {
                  id: this.inputsData.id,
                  email: this.inputsData.userEmail,
                });
                let time = setTimeout(() => {
                  cb(data);
                  clearTimeout(time);
                }, 2000);
              } else {
                cb(null);
                console.log("isReset");
              }
            });
          });

          function isValidateCode(data) {
            return new Promise((resolve) => {
              return resolve('');
              if (socket.connected && data.codeUser.code) {
                let codeUser = data.codeUser.code; //=== data.input.__code;
                let id = data.input.id;
                socket.emit(
                  "manager",
                  { __action: "read", id },
                  (rest1) => {
                    console.log({ rest1 });
                    socket.emit(
                      "manageraccount",
                      {
                        __action: "read",
                        id: rest1?.response?.manageraccount,
                      },
                      (rest) => {
                        socket.emit("verifyCode",{...rest.response, codeuser : codeUser} , (isValid) => {
                          console.log({isValid});
                           resolve(isValid)
                        });
                      }
                    );
                  }
                );
              } else {
                resolve(false);
              }
            });
          }
        });
      },
    };
  }
}

Components.PageInfoCode = PageInfoCode;
