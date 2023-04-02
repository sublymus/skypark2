import mongoose from "mongoose";
import Log from "sublymus_logger";
let uri = "mongodb://localhost:27017/skypark";

mongoose.set("strictQuery", false);
mongoose.connect(uri, (error) => {
  if (error) {
    return Log("mongoose_error", "successfully mongodb connection.....");
  }
  Log("_mongoose_error_connect", "successfully mongodb connection.....");

});