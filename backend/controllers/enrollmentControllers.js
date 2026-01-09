const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const Course = require("../models/Course");
// const Teatcher = require("../models/Teatcher");
const asyncHandler = require("../utils/asyncHandler");

const enroll = async (courseId, studentId) => {
  const newEnrollment = await Enrollment.create({
    course: courseId,
    student: studentId,
  });

  console.log(newEnrollment);

  await User.findByIdAndUpdate(studentId, {
    $addToSet: { courses: courseId },
  });

  const course = await Course.findById(courseId);
  course.studentsCount++;
  await course.save();
  return newEnrollment;
};

const enrollmentController = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.userData._id;

  console.log("course=> " + courseId, "student=> " + studentId);

  let enrollment = await Enrollment.findOne({
    $and: [{ course: courseId }, { student: studentId }],
  }).populate("course");

  if (enrollment)
    return res.status(400).json({ message: "أنت مشترك بالفعل في هذا الكورس" });

  if (await Course.findById(courseId).isFree) {
    enrollment = await enroll(courseId, studentId);
    res.status(201).json({
      success: true,
      message: "تم الاشتراك في الكورس بنجاح",
      data: enrollment,
    });
  } else {
    return res.status(400).json({
      message: "هذا الكورس مدفوع, لحظة وستتوجه لصفحة الدفع...",
      price: await Course.findById(courseId).price,
      mustPay: true,
    });
  }
});

const confirmPayment = async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.userData._id;

  // في الحقيقة هنا نتأكد من شركة الدفع، لكن للتدريب سنفترض النجاح:
  await enroll(courseId, studentId);

  res.status(201).json({
    status: "success",
    message: "تم تسجيلك في الكورس بنجاح بعد عملية الدفع الوهمية",
  });
};

module.exports = {
  enrollmentController,
  confirmPayment,
};
