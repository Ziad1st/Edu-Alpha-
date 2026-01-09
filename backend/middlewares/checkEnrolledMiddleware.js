const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const asyncHandler = require("../utils/asyncHandler");

const checkEnrolledMiddleware = asyncHandler(async (req, res, next) => {
  console.log("checkEnrolledMiddleware=>");

  const lessonId = req.params.id;
  const userId = req.user.userData._id;

  // 1. البحث عن الكورس الذي يحتوي على هذا الدرس
  const course = await Course.findOne({ lessons: lessonId });

  if (!course) {
    return res
      .status(404)
      .json({ message: "هذا الدرس غير مسجل ضمن كورسات المنصة" });
  }

  // 2. التحقق من وجود اشتراك
  const enrollment = await Enrollment.findOne({
    course: course._id,
    student: userId,
  });
  const adminChecker = req.user.userData.role.includes("admin");
  const teatcherOfCourse = course.teatcher == userId;

  // 3. القرار
  if (enrollment) {
    return next(); // الـ return هنا ضرورية جداً
  }

  if (adminChecker) return next();

  if (teatcherOfCourse) return next();

  console.log("enrollment=>" + enrollment ? true : false);
  console.log("adminChecker=>" + adminChecker);
  console.log("teatcherOfCourse=>" + teatcherOfCourse);

  if (!enrollment && !adminChecker && !teatcherOfCourse) {
    return res.status(403).json({
      status: "fail",
      message: "لا تملك صلاحية الدخول: اشترك في الكورس أولاً",
    });
  }

  // 4. إذا لم يجد اشتراك
});

module.exports = { checkEnrolledMiddleware };
