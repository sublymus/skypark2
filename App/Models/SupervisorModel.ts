import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AccountModel from "./AccountModel";
import UserModel from "./UserModel";
import { SQueryMongooseSchema } from "../../lib/squery/Initialize";
//import EntrepiseModel from "./EntrepiseModel";

let SupervisorSchema = SQuery.Schema({
    ...(UserModel.schema as SQueryMongooseSchema).description,
});

const SupervisorModel = mongoose.model("supervisor", SupervisorSchema);

const ctrlMaker = MakeModelCtlForm({
    schema: SupervisorSchema,
    model: SupervisorModel
});

export default SupervisorModel;
