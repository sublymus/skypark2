import { SQuery } from "../lib/squery/SQuery";
SQuery.auth({
  login: "account",
  match: ["email", "password"],
  signup: "user",
});

SQuery.auth({
  login: "account",
  match: ["email", "password"],
  signup: "manager",
});
