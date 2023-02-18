import mongoose from "mongoose";
import Log from "sublymus_logger";
let uri = "mongodb://localhost:27017/skypark";

mongoose.set("strictQuery", false);
mongoose.connect(uri, () => {
  Log("connect", "successfully mongodb connection.....");
});