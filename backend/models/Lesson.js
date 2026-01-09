const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "يجب إدخال عنوان الدرس"],
    },
    description: {
      type: String,
    },
    videoUrl: {
      type: String, // الرابط القادم من Cloudinary هو نص
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // ربط الدرس بالكورس التابع له
      required: true,
    },
    isFree: {
      type: Boolean,
      default: false, // هل الدرس متاح للمعاينة مجاناً؟
    },
    isDone: {
      type: Boolean,
      default: false, // هل الدرس متاح للمعاينة مجاناً؟
    },
    order: {
      type: Number,
      required: [true, "يجب إدخال ترتيب الدرس"], // ترتيب الدرس داخل الكورس
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", LessonSchema);
