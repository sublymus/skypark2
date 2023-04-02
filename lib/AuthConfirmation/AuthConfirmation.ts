import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Log from "sublymus_logger";
import { genereCodePhone } from "./SendPhoneCode";
import { sendWithClickatail } from "./SendPhoneCode2";
import { genereCodeEmail, sendEmail } from "./sendEmailCode";

/* 
...............WENA-PHONE..................
1)user rentre les info pour s'inscrit
2)new wena-phone() recupere le numero de telephone 
3)genere un code , le stocke dans une variable codeStocke et l'envoie au numero recupere ,
4)on initialise la variable expireAt = Date.now() + (1000 * 60) * 2,
5)on appel le callback de configuration et on passe expireAt.
6)user saisir le code de confirmation et l'envoie a wena-phone par socket
7)on verifie le codeUser et le codeStocke , si ça matche return true sinon false.

Squery.socket.emit('signup:user' , data , (res)=> {
  if(res.error){}  if(res.response){}// callback retourne l'id
})
Squery.socket.on('signup/config:user', (config , cb)=>{
  config.expireAt
  buton.addEventListener('click',()=>{
    cb(input.value)
  })
})
*/

type MoreProperty = {
  [p: string]: any;
};
type DataSchema = {
  [p: string]: any;
};

export type AuthExtensionSchema = {
  new(): {
    [str: string]: any;
    confirm: (ctx: ContextSchema) => Promise<boolean>;
    error: () => string;
  };
};
export type authDataSchema = {
  login: string;
  match: string[];
  signup: string;
  extension?: AuthExtensionSchema[];
};
export type ContextSchema = {
  ctrlName: string,
  action: string,
  data: DataSchema,
  socket: Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  >,
  __key: string, /// pour le moment data.__key = cookies[__key]
  __permission: 'user' | 'admin' | 'any'
} & MoreProperty;

export class PhoneConfirmartion {
  #msgError: string;
  async confirm(ctx: ContextSchema): Promise<boolean> {
    let { data, socket } = ctx;
    const code = genereCodePhone();
    if (!(await sendWithClickatail(data.account.telephone, code))) {
      this.#msgError = "code n'a pa pu etre envoye";
      return false;
    }
    const expireAt = Date.now() + 1000 * 60;
    Log("code", { code })
    return await new Promise<boolean>((res) => {
      socket.emit(
        "signup:user/config",
        { expireAt },
        (codeuser: string) => {
          if (Date.now() > expireAt) {
            Log('time', expireAt, Date.now())
            this.#msgError = "expiration du code";
            res(false);
          }
          if (!(codeuser === code)) {

            this.#msgError = "code invalide";
            res(false);
          } else {
            res(true)
          }
        }
      );

    });
  }
  error() {
    return this.#msgError;
  }
}

export class EmailConfirmartion {
  #msgError = "";
  async confirm(ctx: ContextSchema): Promise<boolean> {
    let { data, socket } = ctx;
    const code = genereCodeEmail();
    //console.log({ code });

    if (!(await sendEmail(data.account.email, data.account.name, code))) {
      this.#msgError = "email n'a pa pu etre envoye";
      return false;
    }

    const expireAt = Date.now() + 1000 * 60 * 2;

    return await new Promise<boolean>((res) => {
      socket.emit(
        "signup:user/config",
        { expireAt },
        (codeuser: string) => {
          if (Date.now() > expireAt) {
            this.#msgError = "expiration du code";
            res(false);
          }
          //console.log({ code }, { codeuser });
          if (!(codeuser === code)) {
            this.#msgError = "code invalide";
            res(false);
          } else {
            res(true)
          }
        }
      );

    });
  }
  error() {
    return this.#msgError;
  }
}
