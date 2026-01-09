const mongoose = require("mongoose");
const { generateCategoryCover } = require("../utils/generateImages");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
  },
  teatcher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  studentsCount: {
    type: Number,
    default: 0,
  },
  enroll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enrollment",
  },
});

// في ملف models/Category.js
CourseSchema.set("toJSON", { virtuals: true });
CourseSchema.set("toObject", { virtuals: true });

CourseSchema.virtual("autoCover").get(function () {
  if (this.cover) {
    // نرجع رابط الصورة المرفوعة
    return `${this.cover}`;
  }
  // نولد الصورة البرمجية لو مفيش صورة مرفوعة
  return generateCategoryCover(this.title);
});

CourseSchema.virtual("isFree").get(function () {
  if (this.price > 0) {
    return false;
  }
  return true;
});
CourseSchema.virtual("lessonsCount").get(function () {
  return this.lessons ? this.lessons.length : 0;
});

module.exports = mongoose.model("Course", CourseSchema);
