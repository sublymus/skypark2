import { SQuery } from "../lib/squery/SQuery";
SQuery.Auth({
  login: "account",
  match: ["email", "password"],
  signup: "user",
});

SQuery.Auth({
  login: "account",
  match: ["email", "password"],
  signup: "manager",
});

SQuery.Auth({
  login: "admin",
  match: ["email", "password"],
  signup: "admin",
});
