const lessonVideoBox = document.getElementById("lesson-video-box");
const urlBtn = document.querySelector(".url-btn");
const lessonDescription = document.getElementById("lesson-description");
const lessonTitle = document.getElementById("lesson-title");
const lessonsList = document.getElementById("lessons-list");
const lessonsCount = document.getElementById("lessons-count");
const lessonDone = document.getElementById("lesson-done");

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("course");
const lessonId = urlParams.get("lesson");

import { errorMessageHandler } from "./utils/errorMessage.js";
import { contentLoad } from "./utils/contentLoading.js";
import { smartFetch } from "./utils/fetchWithRefToken.js";
import { renderDom } from "./utils/renderDom.js";

export const fetchCourseData = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
    errorMessageHandler(error.message, error.status);
    return [];
  }
};

const fetchLesson = async (url) => {
  try {
    const res = await smartFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // مهم جداً لإرسال الـ Refresh Token من الكوكيز
    });
    const data = await res.json();
    return data;
  } catch (error) {
    errorMessageHandler(error.message);
    return {};
  }
};

window.addEventListener("load", async () => {
  contentLoad("on");
  urlBtn.setAttribute("course-id", courseId);

  const lesson = await fetchLesson(
    `https://edu-alpha-neon.vercel.app/api/lessons/getOne/${lessonId}`
  );

  if (!lesson.videoUrl) {
    let count = Number(localStorage.getItem("lessonErrored")) || 0;
    console.log(count);
    if (count >= 2) {
      localStorage.removeItem("lessonErrored");
      errorMessageHandler(
        "نعتذر حدث خطأ أثناء رفع المعلم للدرس, سيتم التعامل مع هذه المشكلة قريبا"
      );
      setTimeout(() => {
        window.location = `course.html?course=${courseId}`;
      }, 3000);
    } else {
      count++;
      errorMessageHandler(
        "خطأ في جلب الدرس, راجع إتصالك بالشبكة, سيتم إعادة تحميل الصفحة كمحاولة أخرى"
      );
      setTimeout(() => {
        localStorage.setItem("lessonErrored", count.toString());
        window.location.reload();
      }, 3000);
    }
  }

  const cleanPath = lesson.videoUrl.startsWith("/")
    ? lesson.videoUrl.substring(1)
    : lesson.videoUrl;
  const videoEl = document.createElement("video");
  videoEl.src = `https://edu-alpha-neon.vercel.app/${cleanPath}`;
  videoEl.controls = "true";
  videoEl.oncontextmenu = "return false;";
  videoEl.controlsList = "nodownload";

  lessonVideoBox.innerHTML = "";
  lessonVideoBox.appendChild(videoEl);
  lessonDescription.textContent = lesson.description;
  lessonTitle.textContent = lesson.title;

  const courseData = await fetchCourseData(
    `https://edu-alpha-neon.vercel.app/api/courses/getOne/${courseId}`
  );

  if (!courseData.autoCover || !courseData.title) {
    errorMessageHandler(
      "خطأ في جلب بييانات الكورس , تأكد من الإتصال وحاول مجددا",
      "on"
    );
    return;
  }

  const currentEnrollmentRes = await smartFetch(
    `https://edu-alpha-neon.vercel.app/api/user/getEnrollment/${courseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const currentEnrollmentData = await currentEnrollmentRes.json();

  lessonDone.checked = String(currentEnrollmentData.lessonsCompleted).includes(
    lessonId
  );

  let lessonsListDom = ``;
  if (courseData.lessons.length > 0) {
    courseData.lessons.forEach((lesson) => {
      lessonsListDom += `<li lesson-id="${lesson._id}" class="lesson-li ${
        lesson._id == lessonId ? "active" : ""
      } ${
        String(currentEnrollmentData.lessonsCompleted).includes(lesson._id)
          ? "done"
          : ""
      }">${lesson.title}</li>`;
    });
  } else {
    lessonsListDom = `
      <li class="no-lessons">لم يتم إضافة محتوى الكورس بعد</li>
      `;
  }

  renderDom(lessonsList, lessonsListDom);
  renderDom(lessonsCount, `( ${courseData.lessons.length} )`, "textRendering");

  if (
    currentEnrollmentData.message == "admin" ||
    currentEnrollmentData.message == "course teatcher"
  ) {
    document.querySelector(".lesson-completion-wrapper").style.display = "none";
  } else {
    document.querySelector(".lesson-completion-wrapper").style.display = "flex";
  }

  contentLoad("off");
});

window.addEventListener("click", (e) => {
  const elClicked = e.target;
  const elClickedClassName = elClicked.className;
  if (elClickedClassName == "url-btn") {
    console.log("clicked");
    window.location = `course.html?course=${courseId}`;
  }
  if (elClicked.classList.contains("lesson-li")) {
    const lessonId = elClicked.getAttribute("lesson-id");

    const params = new URLSearchParams({
      course: courseId,
      lesson: lessonId,
    });
    window.location.href = `lesson.html?${params.toString()}`;
  }
});

const updateLessonCompletaion = async (doneStatus) => {
  await smartFetch(
    `https://edu-alpha-neon.vercel.app/api/lessons/update-completion/${lessonId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doneStatus }),
    }
  );
};

lessonDone.addEventListener("change", (e) => {
  updateLessonCompletaion(e.target.checked || false);
  document
    .querySelector("li.lesson-li.active")
    .classList.toggle("done", e.target.checked);
});
