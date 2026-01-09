const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../utils/asyncHandler");

const getMyCourses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("courses");
  res.json(user.courses);
});

const getUserProfile = asyncHandler(async (req, res) => {
  console.log("getUserProfile==> " + req.user);
  const user = await User.findById(req.user.userData._id)
    .select("-password") // حماية الباسورد وعدم إرساله
    .populate({
      path: "courses",
      select: "title cover price lessonsCount", // جلب بيانات الكورس الأساسية فقط
    })
    .populate("coursesIHadCreated"); // للمدرسين

  if (!user) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }

  // يمكنك هنا أيضاً جلب الـ Enrollments الخاصة به لمعرفة الـ Progress
  const enrollments = await Enrollment.find({
    student: req.user.userData._id,
  }).populate({
    path: "course",
    select: "title _id teatcher lessons enroll",
    populate: {
      path: "lessons",
      select: "title _id",
    },
  });

  res.status(200).json({
    success: true,
    user,
    enrollments, // لإظهار نسب التقدم في الـ Profile
  });
});

const getEnrollmentByCourseId = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const studentId = req.user.userData._id;

  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: studentId,
  });

  const ifAdmin = await User.find({ _id: studentId, role: { $in: ["admin"] } });
  const ifCourseTeatcher = await Course.findOne({ teatcher: studentId });

  if (!enrollment) {
    if (ifAdmin) return res.status(200).json({ message: "admin" });
    if (ifCourseTeatcher)
      return res.status(200).json({ message: "course teatcher" });
    return res.status(403).json({ message: "أنت غير مشترك في الكورس" });
  }

  res.status(200).json(enrollment);
});

module.exports = {
  getMyCourses,
  getUserProfile,
  getEnrollmentByCourseId,
};
