import { load } from "../../p.js";
import BaseComponent, {
    Components
} from "../../ts_lib/baseComponent/baseComponent.js";
import SQuery from "../../ts_lib/SQueryClient.js";

export class Signup extends BaseComponent {
    constructor(data) {
        super(
            {
                type: "user",
            },
            data
        );
        const { _, $, $All, viewName } = this.mvc;
        this.view = _(
            "div",
            viewName,
            _("h1", "title", "SIGNUP"),
            _("select@type", "type",
                _('option', ['value:user'], 'User'),
                _('option', ['value:superadmin'], 'Admin'),
                _('option', ['value:manager'], 'Manager'),
                _('option', ['value:entreprisemanager'], 'Entreprise Manager'),
            ),
            _("div", "input-ctn",
                _("textarea", ["rows:100", "cols:450"])
            ),
            _("input", [
                "type:number",
                "placeholder:enter your code",
                "class:number",
            ]),
            _("div", ["class:btnSend"], "SEND"),
            _("div@submit", "submit", "SUBMIT")
        );

        this.controller = {
            ["@type:change"]: (select) => {
                this.type = select.value;
            },
            ["@submit:click"]: () => {
                try {
                    const data = JSON.parse($("textarea").value);

                    SQuery.emit("signup:" + this.type, data, (res) => {
                        if (res.error) return this.emit("error", JSON.stringify(res));
                        console.log("signup:" + this.type , res);
                        this.emit("success", {
                            modelPath: this.type,
                            id: res.response,
                        });
                    });

                } catch (error) {
                    alert(error);
                }


            },
            [viewName]: (view) => {
                this.when("error", (error) => {
                    alert(error);
                });
                SQuery.on("signup:user/config", (data, cb) => {
                    alert("vous avez " + data.expireAt + " pour entrez le code");
                    let btnSend = $(".btnSend");
                    btnSend.style.backgroundColor = "yellow";
                   
                });
                let i = 0;
                let t = 0;
                SQuery.on("ert", (data, cb) => {
                    i = data.i;
                    console.log('ert', data);
                    $(".btnSend").textContent = `i: ${i} - t: ${t}`;
                    $(".btnSend").addEventListener("click", () => {
                        cb(`i:${i*10}_`);
                    });
                });
                SQuery.on("time", (data, cb) => {
                    t = data.t;
                    console.log('time', data);
                    $(".btnSend").textContent = `i: ${i} - t: ${t}`;
                });
                this.when("type", (type) => {
                    //console.log("wertyui");
                    const data = load[type]?.["create"];
                    if (!data)
                        return ($("textarea").value = "Type <" + type + "> Undefined");
                    $("textarea").value = JSON.stringify(data)
                        .split("")
                        .map((c) => {
                            return c == "}" ? "\n}" : c == "{" ? "{\n" : c == "," ? ",\n" : c;
                        })
                        .join("");
                });
            },
        };
    }
}
Components.Signup = Signup;
