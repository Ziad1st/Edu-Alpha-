if (!localStorage.getItem("role")) {
  localStorage.clear();
}

import { errorMessageHandler } from "./errorMessage.js";
import { enrollChecker } from "../courseHadEnrolled.js";

import { userProfile } from "./getUserProfile.js";
import { smartFetch } from "./fetchWithRefToken.js";

// ===============================
// 1) إعداد البيانات الأساسية
// ===============================
const user = userProfile?.user || null;
const userRoles = user?.role || [];
const userEnrollments = userProfile?.enrollments || [];
const tokenFromLS = localStorage.getItem("accessToken");
const isAuthenticated = !!user && !!tokenFromLS;

// جلب معرف الكورس من الـ URL
const urlParams = new URLSearchParams(window.location.search);
const currentCourseId = urlParams.get("course");

// دالة التحقق من الأدوار
const hasRole = (role) => userRoles.includes(role);

// التحقق من اشتراك الطالب في هذا الكورس تحديداً
const isEnrolledInThisCourse = userEnrollments.some(
  (enroll) =>
    enroll.course?._id === currentCourseId || enroll.course === currentCourseId
);

// ===============================
// 2) عناصر الـ DOM
// ===============================
const navLinks = {
  myCourses: document.querySelector("a[href='myCourses.html']"),
  createCourse: document.querySelector("a[href='create-course.html']"),
  login: document.querySelector("a[href='login.html']"),
};

const courseActions = {
  enrollBtn: document.querySelector(".enroll-btn"),
  addLessonBtn: document.querySelector(".add-lesson-btn"),
  lessonsList: document.getElementById("lessons-list"),
};

// ===============================
// 3) منطق الـ Header (القائمة العلوية)
// ===============================
const updateNavbar = () => {
  if (!isAuthenticated) {
    if (navLinks.myCourses) navLinks.myCourses.style.display = "none";
    if (navLinks.createCourse) navLinks.createCourse.style.display = "none";
    return;
  }

  // إظهار "كورساتي" للطالب والمدرس
  const showMyCourses = hasRole("student") || hasRole("teatcher");
  if (navLinks.myCourses)
    navLinks.myCourses.style.display = showMyCourses ? "inline" : "none";

  // إظهار "إنشاء كورس" للمدرس والآدمن فقط
  const showCreate = hasRole("teatcher") || hasRole("admin");
  if (navLinks.createCourse)
    navLinks.createCourse.style.display = showCreate ? "inline" : "none";

  // تحويل "تسجيل الدخول" إلى "خروج"
  if (navLinks.login) {
    navLinks.login.textContent = "تسجيل الخروج";
    navLinks.login.classList.add("logout-style");
    navLinks.login.classList.add("logout");
    navLinks.login.href = "#";
  }
};

// ===============================
// 4) منطق صفحة الكورس والأزرار
// ===============================
const updateCoursePagePermissions = () => {
  if (!courseActions.enrollBtn) return;

  // أولوية الآدمن
  if (hasRole("admin")) {
    if (window.location.href.includes("lesson.html"))
      document.querySelector(".lesson-completion-wrapper").style.display =
        "none";
    courseActions.enrollBtn.textContent = "Admin Control";
    courseActions.enrollBtn.disabled = true;
    if (courseActions.addLessonBtn)
      courseActions.addLessonBtn.style.display = "block";
    return;
  }

  // أولوية المعلم صاحب الكورس
  // ملاحظة: نفترض أن enrollChecker.role يأتي من الـ Backend لتحديد إذا كان هو صاحب الكورس
  if (enrollChecker.role === "teatcher") {
    if (window.location.href.includes("lesson.html"))
      document.querySelector(".lesson-completion-wrapper").style.display =
        "none";
    courseActions.enrollBtn.textContent = "المُحاضِر";
    courseActions.enrollBtn.disabled = true;
    if (courseActions.addLessonBtn)
      courseActions.addLessonBtn.style.display = "block";
    return;
  }

  // حالة الطالب
  if (hasRole("student")) {
    if (isEnrolledInThisCourse || enrollChecker.status) {
      courseActions.enrollBtn.textContent = "تم الإشتراك بنجاح";
      courseActions.enrollBtn.disabled = true;
    } else {
      courseActions.enrollBtn.textContent = "إشترك الآن";
      courseActions.enrollBtn.disabled = false;
    }
    // الطالب لا يرى زر إضافة درس أبداً
    if (courseActions.addLessonBtn) {
      courseActions.addLessonBtn.style.display = "none";
    }

    if (document.querySelectorAll("span.delete-btn")[0]) {
      document
        .querySelectorAll(".delete-btn")
        .forEach((e) => (e.style.display = "none"));
    }
  }

  // إذا لم يكن مسجل دخول
  if (!isAuthenticated) {
    courseActions.enrollBtn.textContent = "سجل الدخول لتشترك";
    courseActions.enrollBtn.classList.add("go-to-login");
    if (courseActions.addLessonBtn)
      courseActions.addLessonBtn.style.display = "none";
  }
};

// ===============================
// 5) حماية قائمة الدروس
// ===============================
const protectLessons = () => {
  if (!courseActions.lessonsList) return;

  const canAccessContent =
    hasRole("admin") ||
    enrollChecker.role === "teatcher" ||
    isEnrolledInThisCourse ||
    enrollChecker.status;

  if (!canAccessContent) {
    courseActions.lessonsList.classList.add("not-allowed");
    courseActions.lessonsList.style.opacity = "0.7";

    courseActions.lessonsList.onclick = (e) => {
      e.preventDefault();
      if (!isAuthenticated) {
        window.location.href = "login.html";
      } else {
        alert("يجب الإشتراك في الكورس لمشاهدة الدروس");
        e.target.disabled = true;
      }
    };
  }
};

// تنفيذ العمليات
updateNavbar();
updateCoursePagePermissions();
protectLessons();

setInterval(() => {
  updateNavbar();
  updateCoursePagePermissions();
  protectLessons();
}, 3000);
//^ logout

const logoutFunc = async () => {
  try {
    await smartFetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ _id: userProfile.user._id }), // مهم جداً لإرسال الـ Cookies الخاصة بالـ Token
    });

    // مسح التوكن من الـ LocalStorage
    localStorage.clear();

    // توجيه المستخدم لصفحة تسجيل الدخول
    window.location.href = "login.html";
  } catch (error) {
    errorMessageHandler(` فشل تسجيل الخروج ${error.message || error || ""}`);
  }
};
window.addEventListener("click", async (e) => {
  const elClicked = e.target;
  if (
    elClicked.classList.contains("logout") &&
    elClicked.textContent == "تسجيل الخروج"
  ) {
    e.preventDefault();
    let areYouSure = window.confirm("هل أنت متأكد من تسجيل الخروج");
    if (areYouSure) {
      await logoutFunc();
      localStorage.clear();
      window.location.href = "login.html";
    } else null;
  }
});
