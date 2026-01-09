const multer = require("multer");
const path = require("path");

// تحديد مكان التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/videos/"); // تأكد من إنشاء هذا المجلد في مشروعك
  },
  filename: function (req, file, cb) {
    // تسمية الملف بـ timestamp + الاسم الأصلي لتجنب التكرار
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// فلترة الملفات للتأكد أنها فيديوهات فقط
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new Error("عذراً، يجب رفع ملف فيديو فقط!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB
  },
});
module.exports = { upload };
