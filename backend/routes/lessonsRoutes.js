const express = require("express");
const router = express.Router();
const {
  createLesson,
  updateLessonCompletion, // الدالة الجديدة التي سنضيفها للـ Controller
  getLesson,
  deleteLesson,
} = require("../controllers/lessonsControllers");
const verifyRoles = require("../middlewares/verifyRoles");
const {
  checkEnrolledMiddleware,
} = require("../middlewares/checkEnrolledMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

// 1) مسار إنشاء الدرس (JSON فقط)
// هذا المسار يستقبل العنوان والوصف وcourseId
router.post("/", authMiddleware, verifyRoles("teatcher admin"), createLesson);

// 2) مسار رفع الفيديو (Multipart/FormData)
// نستخدم PATCH لأننا نحدث سجل الدرس الذي تم إنشاؤه بالفعل بملف الفيديو
router.post(
  "/",
  authMiddleware,
  verifyRoles("teatcher admin"),
  createLesson // الدالة التي ستحفظ البيانات في MongoDB
);

router.patch(
  "/update-completion/:id",
  authMiddleware, // التأكد من أن المستخدم مسجل دخول
  updateLessonCompletion
);

router.get(
  "/getOne/:id",
  authMiddleware,
  checkEnrolledMiddleware,
  verifyRoles("student teatcher admin"),
  getLesson
);

router.delete(
  "/deleteOne/:id",
  authMiddleware,
  verifyRoles("teatcher admin"),
  deleteLesson
);

module.exports = router;
