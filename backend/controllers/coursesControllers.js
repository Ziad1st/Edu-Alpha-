const Course = require("../models/Course");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const createCourse = asyncHandler(async (req, res) => {
  const { title, description, cover, price, category } = req.body;

  // 1. استخراج الـ teatcherId بأمان من الـ User الموثق (Auth Middleware)
  // نفضل الاعتماد على التوكن لمنع التلاعب بالهوية
  const teatcherId = req.user?.userData?._id || req.body.teatcher;

  // 2. التحقق من الحقول المطلوبة (Validation)
  if (!title || !description || !price || !category) {
    throw new ApiError(
      "جميع الحقول (العنوان، الوصف، السعر، القسم) مطلوبة",
      400
    );
  }

  // 3. التحقق من عدم تكرار الكورس (تجنب التحسس الشديد للوصف، يفضل العنوان فقط)
  const existingCourse = await Course.findOne({ title });
  if (existingCourse) {
    throw new ApiError("هذا العنوان مستخدم بالفعل، اختر عنواناً مميزاً", 400);
  }

  // 4. إنشاء الكورس (بناءً على الـ Model الخاص بك)
  const course = await Course.create({
    title,
    teatcher: teatcherId, // لاحظ كلمة teatcher كما هي في الموديل عندك
    description,
    cover: cover || "", // تجنب القيم الـ null
    price: Number(price), // التأكد من أنه رقم
    category,
  });

  // 5. تحديث مصفوفة الكورسات عند المستخدم (المعلم)
  // نستخدم findByIdAndUpdate لأنه أسرع وأقل استهلاكاً للذاكرة من الـ save اليدوي
  await User.findByIdAndUpdate(teatcherId, {
    $push: { coursesIHadCreated: course._id },
  });

  // 6. إرسال الرد بشكل كائن (Object) وليس مصفوفة (Array)
  // هذا يسهل على الفرونت إند قراءة البيانات ويمنع أخطاء الـ JSON
  res.status(201).json({
    success: true,
    message: "تم إنشاء الكورس بنجاح",
    course: course,
  });
});

const getAllCourses = asyncHandler(async (req, res) => {
  res.json(
    await Course.find()
      .sort({ createdAt: -1 })
      .populate("teatcher", "fullname _id")
  );
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate([
    {
      path: "teatcher",
      select: "fullname _id",
    },
    {
      path: "lessons",
      // اختياري: إذا كنت تريد ترتيب الدروس حسب حقل order
      options: { sort: { order: 1 } },
    },
  ]);
  if (!course) throw new ApiError("Course not found", 404);
  res.json(course);
});

const getCoursesCategory = asyncHandler(async (req, res) => {
  const category = req.params.id;

  console.log(category);
  const courses = await Course.find({ category }).populate(
    "teatcher",
    "fullname image"
  );
  if (!courses) throw new ApiError("Category doesn't exist", 404);
  res.status(200).json(courses);
});

const getCoursesByTeatcher = asyncHandler(async (req, res) => {
  const teatcher = req.params.id;

  const courses = await Course.find({ teatcher }).populate(
    "teatcher",
    "fullname image _id"
  );
  console.log(courses);
  res.status(400).json(courses);
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  getCoursesCategory,
  getCoursesByTeatcher,
};
