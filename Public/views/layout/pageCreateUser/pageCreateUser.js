import BaseComponent, {
  Components
} from "../../ts_lib/baseComponent/baseComponent.js";
import SQuery from "../../ts_lib/SQueryClient.js";

const socket = SQuery.socket;
export default class PageCreateUser extends BaseComponent {
  constructor(data) {
    super(
      {
        loadingIcon: "/img/email.gif",
        leftLabel: "Back",
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
          name: "telephone",
        }),
        _("InputUi", {
          type: "text",
          icon: "permission",
          hint: "Status",
          name: "status",
        }),
        _("InputUi", {
          type: "text",
          icon: "village",
          hint: "City",
          name: "city",
        }),
        _("InputUi", {
          type: "text",
          icon: "building",
          hint: "Building",
          name: "building",
        }),
        _("InputUi", {
          type: "text",
          icon: "building",
          hint: "Door",
          name: "door",
        }),
        _("InputUi", {
          type: "text",
          icon: "upstairs",
          hint: "Etage",
          name: "etage",
        }),
        _("InputUi", {
          type: "text",
          icon: "interior-design",
          hint: "Room",
          name: "room",
        }),
      ),
    );

    this.controller = {
      ['@submit:click']: (submit) => {

      },
      [viewName]: (view) => {
        this.when("get_data", (cb) => {
          const data = {};
          $All('input').forEach((input) => {
            data[input.name] = input.value
          })
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
              socket.emit("signup", {
                __action: "create",
                __modelPath: "user",
                account: {
                  name: data.name,
                  email: data.email,
                  password: data.email,
                  telephone: data.telephone,
                  status: data.status,
                  address: {
                    location: "l:567455;h45678654",
                    building: {
                      name: data.building,
                      city: data.city,
                    },
                    room: data.room,
                    door: data.door,
                    etage: data.etage,
                  },
                  description: "je suis ici",
                },
              },
                (id) => {
                  //console.log({ id });
                  data = id;
                  socket.emit("sendEmail", { userEmail, userName, code });
                  time = setTimeout(() => {
                    //console.log({ id });
                    cb({ id, userEmail });
                    clearTimeout(time);
                  }, 1000);
                })
            });
          });

          /////// dit au server de faire un send Email
          /////// le server nous revoie le meme code en crypter
          //////  data.__code = code
          /////// then All Ok

        });
        function isValidateInfoPerso(data) {
          const emailRegex =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/i;
          let userEmail = data.email;
          let userName = data.name;
          let userPhone = data.phone;
          //console.log(data);
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
          return (
            validateEmail() &&
            validateName() &&
            validatePhone()
          );
        }
      },
    };
  }
}

Components.PageCreateUser = PageCreateUser;
