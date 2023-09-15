import mongoose, { Schema } from "mongoose";
import { SQuery } from "../../lib/squery/SQuery";
import {AccountController} from "./AccountModel";
import {UserController} from "./UserModel";
import { SQueryMongooseSchema } from "../../lib/squery/Initialize";
//import EntrepiseModel from "./EntrepiseModel";

let SupervisorSchema = SQuery.Schema({
    ...UserController.schema.description,
});

export const SupervisorController = new SQuery.ModelController({
    name:'supervisor',
    schema: SupervisorSchema
  });