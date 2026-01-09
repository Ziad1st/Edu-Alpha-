const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../utils/asyncHandler");

const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    res.status(404);
    throw new Error("الدرس غير موجود");
  }

  // --- خطوة حذف الفيديو من Cloudinary ---
  if (lesson.videoUrl) {
    try {
      // استخراج الـ Public ID من الرابط
      // الرابط يكون عادة: https://res.cloudinary.com/cloudname/video/upload/v123/folder/public_id.mp4
      const parts = lesson.videoUrl.split('/');
      const fileName = parts[parts.length - 1]; // public_id.mp4
      const publicId = fileName.split('.')[0]; // public_id
      
      // إذا كنت ترفع الفيديوهات في مجلد معين (مثل lessons)
      // publicId = "lessons/" + publicId;

      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      console.log("✅ تم حذف الفيديو من Cloudinary");
    } catch (error) {
      console.error("❌ فشل حذف الفيديو من Cloudinary:", error);
      // لا نوقف العملية هنا لضمان حذف السجل من قاعدة البيانات حتى لو فشل حذف الفيديو
    }
  }

  // --- تكملة كود الحذف الخاص بك ---
  await Lesson.findByIdAndDelete(lessonId);
  
  await Course.findByIdAndUpdate(lesson.courseId, {
    $pull: { lessons: lessonId },
  });

  await Enrollment.updateMany(
    { courseId: lesson.courseId },
    { $pull: { lessonsCompleted: lessonId } }
  );

  res.status(200).json({ message: "تم حذف الدرس والفيديو بنجاح" });
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
