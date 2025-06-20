const mongoose = require("mongoose");
require("dotenv").config();

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("MongoDB Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the MongoDB database:", error);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
