const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../utils/asyncHandler");
// 1) إنشاء سجل الدرس (بدون فيديو)
const createLesson = asyncHandler(async (req, res) => {
  const { title, courseId, description, order, isFree } = req.body;

  const newLesson = await Lesson.create({
    title,
    description,
    courseId,
    order,
    isFree,
    videoUrl: "", // سيبقى فارغاً حتى يتم رفع الفيديو في الطلب الثاني
  });

  // ربط الدرس بالكورس
  await Course.findByIdAndUpdate(courseId, {
    $push: { lessons: newLesson._id },
  });

  res.status(201).json({
    message: "تم إنشاء سجل الدرس بنجاح، جاري بدء رفع الفيديو...",
    lessonId: newLesson._id, // نرسل الـ ID للفرونت إند ليستخدمه في طلب الرفع
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

// 2) رفع الفيديو وتحديث السجل (باستخدام Multer)
const uploadLessonVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "يرجى اختيار فيديو للرفع" });
  }

  const { lessonId } = req.params;

  // تحديث سجل الدرس بمسار الفيديو الجديد
  const updatedLesson = await Lesson.findByIdAndUpdate(
    lessonId,
    { videoUrl: `/uploads/videos/${req.file.filename}` },
    { new: true }
  );

  console.log(updatedLesson, "\n video url ===> " + updatedLesson.videoUrl);

  res.status(200).json({
    message: "تم رفع الفيديو بنجاح",
    videoUrl: updatedLesson.videoUrl,
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
  uploadLessonVideo,
  updateLessonCompletion,
  deleteLesson,
};
