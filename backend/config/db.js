const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("connected To DB successfully...");
  } catch (err) {
    if (err) return console.log(err.message);
  }
};

module.exports = connectDB;
