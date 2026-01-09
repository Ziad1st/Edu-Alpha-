const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../utils/asyncHandler");
// 1) إنشاء سجل الدرس (بدون فيديو)
// 1) إنشاء سجل الدرس (مع رابط الفيديو مباشرة)
const createLesson = asyncHandler(async (req, res) => {
  // أضفنا videoUrl هنا لاستقباله من الـ req.body
  const { title, courseId, description, order, isFree, videoUrl } = req.body;

  // التحقق من أن رابط الفيديو موجود
  if (!videoUrl) {
    res.status(400);
    throw new Error("يرجى تزويد رابط الفيديو (Cloudinary URL)");
  }

  const newLesson = await Lesson.create({
    title,
    description,
    courseId,
    order,
    isFree,
    videoUrl, // يتم حفظ الرابط القادم من Cloudinary هنا مباشرة
  });

  // ربط الدرس بالكورس
  await Course.findByIdAndUpdate(courseId, {
    $push: { lessons: newLesson._id },
  });

  res.status(201).json({
    message: "تم إنشاء الدرس بنجاح وحفظ الفيديو أونلاين",
    lesson: newLesson,
  });
});

const deleteLesson = asyncHandler(async (req, res) => {
  const lessonId = req.params.id;
  const userId = req.user.userData._id;
  const userRole = req.user.userData.role;

  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    res.status(404);
    throw new Error("الدرس غير موجود");
  }

  const course = await Course.findById(lesson.courseId);

  const isOwner = course.teatcher.toString() === userId.toString();
  const isAdmin = String(userRole).includes("admin");

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("غير مسموح لك بحذف هذا الدرس");
  }

  // 1. حذف الدرس من جدول الدروس
  await Lesson.findByIdAndDelete(lessonId);

  // 2. تحديث الكورس: إزالة الدرس من مصفوفة الـ lessons
  await Course.findByIdAndUpdate(lesson.courseId, {
    $pull: { lessons: lessonId },
  });

  // 3. التحديث الجديد: إزالة الدرس من سجلات الطلاب (Enrollments)
  // سنقوم بالبحث عن كل الـ Enrollments الخاصة بهذا الكورس وحذف الـ lessonId من قائمة المكتمل
  await Enrollment.updateMany(
    { courseId: lesson.courseId }, // ابحث عن كل الطلاب المشتركين في هذا الكورس
    { $pull: { lessonsCompleted: lessonId } } // احذف هذا الدرس من قائمة الدروس المكتملة لديهم
  );

  res.status(200).json({
    message: "تم حذف الدرس بنجاح بواسطة " + (isAdmin ? "المسؤول" : "المعلم"),
  });
});

const getLesson = asyncHandler(async (req, res) => {
  console.log("getLessonController=> ");
  const id = req.params.id;
  const lesson = await Lesson.findById(id);
  console.log(lesson);

  res.status(200).json(lesson);
});

const updateLessonCompletion = asyncHandler(async (req, res) => {
  console.log("updateLessonCompletion=> ");
  const { doneStatus } = req.body;
  const lessonId = req.params.id;
  const studentId = req.user.userData._id;

  const course = await Course.findOne({ lessons: lessonId });
  const enrollment = await Enrollment.findOne({
    course: course._id,
    student: studentId,
  });

  if (!enrollment) res.status(403).json({ message: "أنت غير مشترك في الكورس" });

  if (doneStatus) {
    enrollment.lessonsCompleted.push(lessonId);
  } else {
    enrollment.lessonsCompleted.splice(
      enrollment.lessonsCompleted.indexOf(lessonId),
      1
    );
  }
  enrollment.progress = (
    (enrollment.lessonsCompleted.length / course.lessons.length) *
    100
  ).toFixed(3);
  enrollment.save();

  res.json({ message: "تم تحديث مستوى التقدم في الكورس بنجاح" });
});

module.exports = {
  createLesson,
  getLesson,
  updateLessonCompletion,
  deleteLesson,
};
