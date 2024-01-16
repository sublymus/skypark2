import mongoose from "mongoose";
let uri = "mongodb://127.0.0.1:27017/skypark";

mongoose.set("strictQuery", false);
(async () => {
  try {
    const db = await mongoose.connect('mongodb://127.0.0.1:27017/skypark');
    console.log('mongoose connect Models Count = '+db.modelNames.length);
    
  } catch (error) {
    console.log(error);
  }
})();