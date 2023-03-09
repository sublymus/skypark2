import { EmailConfirmartion, PhoneConfirmartion } from "../lib/AuthConfirmation/AuthConfirmation";
import { SQuery } from "../lib/squery/SQuery";

SQuery.auth({
  login: "account",
  extension : [PhoneConfirmartion],
  match: ["email", "password"],
  signup: "user",
});

SQuery.auth({
  login: "manageraccount",
  extension : [PhoneConfirmartion],
  match: ["phone", "password"],
  signup: "manager",
});
