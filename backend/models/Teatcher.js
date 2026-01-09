const mongoose = require("mongoose");

const TeatcherSchema = new mongoose.Schema({
  fullname: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  rating: {
    type: Number,
    default: 0,
  },
  studentsCount: {
    type: Number,
    default: 0,
  },
  specialaizeIn: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Teatcher", TeatcherSchema);
