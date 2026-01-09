const mongoose = require("mongoose");
const { generateCategoryCover } = require("../utils/generateImages");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 150,
    },

    customCover: { type: String }, // الصورة التي يرفعها المستخدم (اختياري)
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// في ملف models/Category.js
categorySchema.virtual("cover").get(function () {
  if (this.customCover) {
    // نرجع رابط الصورة المرفوعة
    return `http://localhost:${process.env.PORT}${this.customCover}`;
  }
  // نولد الصورة البرمجية لو مفيش صورة مرفوعة
  return generateCategoryCover(this.name);
});

categorySchema.virtual("coursesCount", {
  ref: "Course", // الموديل الذي نبحث فيه
  foreignField: "category", // الحقل في موديل الـ Course الذي يشير للـ Category
  localField: "_id", // الحقل في موديل الـ Category
  count: true, // أخبر Mongoose أننا نريد "العدد" فقط وليس مصفوفة الكورسات
});

module.exports = mongoose.model("Category", categorySchema);
