import { contentLoad } from "./utils/contentLoading.js";
import { errorMessageHandler } from "./utils/errorMessage.js";
import { renderDom } from "./utils/renderDom.js";

const fetchData = async (url) => {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    errorMessageHandler(error.message, "on");
    return [];
  }
};

const teachersContainer = document.getElementById("teachers-container");

window.addEventListener("load", async () => {
  contentLoad("on");

  // تشغيل الطلبات بالتوازي بدلاً من الانتظار الواحدة تلو الأخرى
  const [teachers, courses] = await Promise.all([
    fetchData("https://edu-alpha-neon.vercel.app/api/teatchers"),
    fetchData("https://edu-alpha-neon.vercel.app/api/courses/getAll"),
  ]);

  // تحسين الأداء: حساب عدد الطلاب لكل مدرس مرة واحدة فقط وتخزينها في Map
  const teacherStudentsMap = new Map();
  courses.forEach((course) => {
    const teacherId = course.teatcher._id;
    teacherStudentsMap.set(
      teacherId,
      (teacherStudentsMap.get(teacherId) || 0) + (course.studentsCount || 0)
    );
  });

  const startsRate = (rating) => {
    const rateStars = ["☆☆☆☆☆", "☆☆☆☆★", "☆☆☆★★", "☆☆★★★", "☆★★★★", "★★★★★"];
    return rateStars[Math.round(rating)] || rateStars[0];
  };

  const teatcherLevels = [
    "معتمد 🎖️",
    "محترف 👨‍💻",
    "موثوق ✅",
    "خبير 🧠",
    "أكاديمي 🎓",
  ];

  // بناء الـ HTML باستخدام Array.map و join أسرع من الـ += داخل الـ forEach
  const domEl = teachers
    .map((teatcher) => {
      const studentsCount = teacherStudentsMap.get(teatcher._id) || 0;
      const randomLevel =
        teatcherLevels[Math.floor(Math.random() * teatcherLevels.length)];

      return `
      <div teatcher-id="${teatcher._id}" class="teacher-card">
        <div class="image">
          <img src="${teatcher.image}" alt="${teatcher.fullname} مدرس موهوب">
        </div>
        <h4>أ. ${teatcher.fullname}</h4>
        <p class="specialize-in">مختص بـ ${teatcher.specialization.join(
          ", "
        )}</p>
        <p class="students">يدرس معه <span class="number">${studentsCount}</span> من الطلاب</p>
        <p class="rates">
          <span class="stars">${startsRate(teatcher.teatcherRating)}</span>
          <span class="state-rate">${randomLevel}</span>
        </p>
        <button id="join-to-courses" class="join-to-courses primary-btn">إنضم للكورسات</button>
      </div>`;
    })
    .join("");

  renderDom(teachersContainer, domEl);
  contentLoad("off");
});

// تحسين: استخدام Event Delegation واحد بدلاً من شروط متعددة
window.addEventListener("click", (e) => {
  const target = e.target;

  if (target.id === "join-to-courses") {
    const teatcherId = target
      .closest(".teacher-card")
      .getAttribute("teatcher-id");
    window.location.href = `courses.html?teatcher=${teatcherId}`;
  }

  if (
    target.textContent.trim() === "إنضم كمعلم" ||
    target.textContent.trim() === "إنضم إلينا كمعلم"
  ) {
    window.location.href = "register-teacher.html";
  }
});
