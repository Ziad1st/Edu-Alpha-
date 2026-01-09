const connectDB = require("./config/db");
const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

connectDB();
const PORT = process.env.PORT || 5000;

mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`SERVER RUNNING => http://localhost:${PORT}`);
  });
});

mongoose.connection.on("error", (err) => console.log(err.message));
