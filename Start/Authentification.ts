import { SQuery } from "../lib/squery/SQuery";
SQuery.auth({
  login: "account",
  //extension: [EmailConfirmartion],
  match: ["email", "password"],
  signup: "user",
});
SQuery.auth({
  login: "account",
  //extension: [EmailConfirmartion],
  match: ["email", "password"],
  signup: "entreprisemanager",
});

SQuery.auth({
  login: "account",
  //extension: [EmailConfirmartion],
  match: ["email", "password"],
  signup: "manager",
});
