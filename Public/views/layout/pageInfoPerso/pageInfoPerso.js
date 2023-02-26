import BaseComponent, {
  Components,
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
        }),
        _("InputUi", {
          type: "email",
          icon: "email",
          hint: "Email",
          name: "email",
        }),
        _("InputUi", {
          type: "text",
          icon: "phone",
          hint: "Telephone",
          name: "phone",
        }),
        _("InputUi", {
          type: "password",
          icon: "padlock",
          hint: "Password",
          name: "password",
        }),
        _("InputUi", {
          type: "password",
          icon: "padlock",
          hint: "Password",
          name: "password2",
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
        this.when("get_data", (cb) => {
          const data = {
            name: $('input[name^="name"]').value,
            email: $('input[name^="email"]').value,
            phone: $('input[name^="phone"]').value,
            password: $('input[name^="password"]').value,
            password2: $('input[name^="password2"]').value,
          };
          this.data = data;
          cb(data);
        });
        let code = "";
        let time = "";
        this.when("next", (cb) => {
          this.emit("get_data", (data) => {
            let isOk = isValidateInfoPerso(data);
            if (socket.connected && isOk) {
            }
            let userEmail = data.email;
            let userName = data.name;
            socket.emit("sendCode", { userEmail, userName }, (resCode) => {
              code = resCode;
              socket.emit(
                "signup",
                {
                  __action: "create",
                  __modelPath : "manager",
                  ...{
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                    codes: resCode,
                  }, 
                },
                (id) => {
                  console.log({ id });
                  data = id;
                  socket.emit("sendEmail", { userEmail, userName, code });
                  time = setTimeout(() => {
                    console.log({id});
                    cb({id , userEmail });
                    clearTimeout(time);
                  }, 1000);
                }
              );
            });

            /////// dit au server de faire un send Email
            /////// le server nous revoie le meme code en crypter
            //////  data.__code = code
            /////// then All Ok

            if (!isOk) clearTimeout(time);
          });
        });
        function isValidateInfoPerso(data) {
          const emailRegex =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/i;
          let userEmail = data.email;
          let userName = data.name;
          let userPhone = data.phone;
          let userPassword = data.password;
          let userPassword2 = data.password2;
          console.log(data);
          function validateEmail() {
            return emailRegex.test(userEmail) && userEmail !== "";
          }
          function validateName() {
            return (
              userName.length >= 3 && userName.length <= 30 && userName !== ""
            );
          }
          function validatePhone() {
            return userPhone !== "";
          }

          function isSamePsswdAndvalid() {
            return userPassword === userPassword2 && userPassword !== "";
          }

          console.log(
            validateEmail(),
            validateName(),
            validatePhone(),
            isSamePsswdAndvalid()
          );
          return (
            validateEmail() &&
            validateName() &&
            validatePhone() &&
            isSamePsswdAndvalid()
          );
        }
      },
    };
  }
}

Components.PageInfoPerso = PageInfoPerso;
