import { contentLoad } from "./utils/contentLoading.js";
import { errorMessageHandler } from "./utils/errorMessage.js";
import { renderDom } from "./utils/renderDom.js";
import { smartFetch } from "./utils/fetchWithRefToken.js";

const courseTitle = document.getElementById("course-title");
const lessonVideoBox = document.getElementById("lesson-video-box");
const lessonsList = document.getElementById("lessons-list");
const lessonsCount = document.getElementById("lessons-count");
const courseDescription = document.getElementById("course-description");
let isFree = false;
export const fetchData = async (url) => {
  try {
    const res = await smartFetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    errorMessageHandler(error.message, error.status);
    return [];
  }
};

const generateRandomEmoji = () => {
  const courseIcons = [
    "🎁", // هدية (المستخدمة حالياً)
    "🔥", // عرض ساخن
    "⚡", // عرض سريع
    "✨", // كورس مميز
    "🎯", // كورس موجه لهدف محدد
    "🚀", // انطلاقة جديدة
    "🎉", // عرض احتفالي
    "💰", // أفضل قيمة مقابل سعر
    "🏷️", // خصم خاص
  ];

  return courseIcons[Math.floor(Math.random() * courseIcons.length)];
};

window.addEventListener("load", async () => {
  contentLoad("on");
  const courseId = window.location.search.split("=")[1];
  if (!courseId) return;
  const courseData = await fetchData(
    `http://localhost:5000/api/courses/getOne/${courseId}`
  );

  if (!courseData.autoCover || !courseData.title) {
    errorMessageHandler("خطأ في جلب بيانات الكورس", "on");
    return;
  }

  const currentEnrollmentRes = await smartFetch(
    `http://localhost:5000/api/user/getEnrollment/${courseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const currentEnrollmentData = await currentEnrollmentRes.json();

  isFree = courseData.isFree;

  const courseCoverImg = document.createElement("img");
  courseCoverImg.src = courseData.autoCover;
  lessonVideoBox.innerHTML = "";
  lessonVideoBox.appendChild(courseCoverImg);

  renderDom(
    courseTitle,
    ` -  كورس : ${courseData.title} سعره ( ${
      courseData.price
    } جــ ) ${generateRandomEmoji()} `,
    "textRendering"
  );
  renderDom(courseDescription, courseData.description, "textRendering");

  let lessonsListDom = ``;
  if (courseData.lessons.length > 0) {
    courseData.lessons.forEach((lesson) => {
      lessonsListDom += `<li lesson-id="${lesson._id}" 
      class="lesson-li ${
        String(currentEnrollmentData.lessonsCompleted).includes(lesson._id)
          ? "done"
          : ""
      }">
      <span class="delete-btn">&times;</span>
      ${lesson.title}
      </li>`;
    });
  } else {
    lessonsListDom = `
      <li class="no-lessons">لم يتم إضافة محتوى الكورس بعد</li>
      `;
  }

  renderDom(lessonsList, lessonsListDom);
  renderDom(lessonsCount, `( ${courseData.lessons.length} )`, "textRendering");

  if (document.querySelector(".enroll-btn")) {
    const enrollBtn = document.querySelector(".enroll-btn");
    if (courseData.isFree) {
      enrollBtn.classList.add("free");
    }
  }

  contentLoad("off");
});

async function confirmEnrollment() {
  const courseId = window.location.search.split("=")[1];

  try {
    const res = await smartFetch(
      `http://localhost:5000/api/enrollments/confirm-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: courseId }),
      }
    );

    if (res.ok) {
      alert("تم الاشتراك بنجاح!");
      window.location.reload(); // لإخفاء زر الاشتراك وإظهار محتوى الكورس
    }
  } catch (error) {
    errorMessageHandler(error.message);

    console.error("Enrollment error:", error);
  }
}

const deleteLesson = async (lessonId) => {
  const res = await smartFetch(
    `http://localhost:5000/api/lessons/deleteOne/${lessonId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return alert((await res.json()).message);
};

window.addEventListener("click", async (e) => {
  const elClicked = e.target;
  const courseId = window.location.search.split("=")[1];
  const elClickedClassName = elClicked.className;
  if (elClickedClassName == "add-lesson-btn") {
    window.location = `add-lesson.html?course=${courseId}`;
  }

  const lessonId = elClicked.getAttribute("lesson-id");
  if (elClicked == document.getElementById("close-pop")) {
    document.getElementById("paymentModal").classList.add("hidden");
  }
  if (
    String(elClicked.classList).includes("lesson-li") &&
    !String(elClicked.parentElement.classList).includes("not-allowed")
  ) {
    const params = new URLSearchParams({
      course: courseId,
      lesson: lessonId,
    });
    window.location.href = `lesson.html?${params.toString()}`;
  }
  if (
    String(elClicked.classList).includes("go-to-login") ||
    elClicked.textContent == "سجل الدخول ثم إشترك"
  ) {
    window.location.href = "login.html";
  }

  if (elClicked.classList.contains("enroll-btn")) {
    const enrollBtn = document.querySelector(".enroll-btn");
    if (!enrollBtn.classList.contains("free") && !isFree) {
      const courseData = await fetchData(
        `http://localhost:5000/api/courses/getOne/${courseId}`
      );
      const modalCourseName = courseData.title;
      const modalCoursePrice = courseData.price;
      setTimeout(() => {
        // 1. جلب عناصر الـ Modal من الـ DOM
        const modal = document.getElementById("paymentModal");

        // 2. تحديث بيانات الـ Modal قبل إظهاره
        // سنفترض أن بيانات الكورس مخزنة في متغيرات عندك أو نجلبها من الصفحة

        document.querySelector("#modalCourseName").textContent =
          modalCourseName;

        document.querySelector(
          "#modalCoursePrice"
        ).textContent = `${modalCoursePrice} ج.م`;

        // 3. إظهار الـ Modal (إزالة hidden أو تغيير الـ display)
        modal.classList.remove("hidden");
        modal.style.display = "flex"; // لضمان الظهور كـ Flexbox في المنتصف
      }, 1300);
    }
  }

  if (elClicked.classList.contains("enroll-confirm-btn")) {
    await confirmEnrollment();
  }
  if (elClicked.classList.contains("delete-btn")) {
    await deleteLesson(elClicked.parentElement.getAttribute("lesson-id"));
    window.location.reload();
  }
});
