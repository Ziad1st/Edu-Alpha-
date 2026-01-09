import { smartFetch } from "./utils/fetchWithRefToken.js";
import { userProfile } from "./utils/getUserProfile.js";
import { contentLoad } from "./utils/contentLoading.js";
import { renderDom } from "./utils/renderDom.js";

/**@type {Array} */
const enrollmentInfo = await userProfile.enrollments;
console.log(enrollmentInfo);
const myCoursesContainer = document.querySelector(".my-courses");
const boxLevel = document.querySelector(".level-box");
const level = boxLevel.querySelector(".level");
const levelStars = boxLevel.querySelector(".stars");

/**
 *>> enrollmentInfo = [{progress1},{progress2}]
 *
 */

const calcProgress = () => {
  // 1. تصفية الكورسات اللي فيها دروس فعلياً فقط
  const validEnrollments = enrollmentInfo.filter(
    (e) => e.course && e.course.lessonsCount > 0
  );

  // 2. حماية لو مفيش ولا كورس صالح للحساب
  if (validEnrollments.length === 0) return 0;

  let sumOfProgresses = 0;

  validEnrollments.forEach((e) => {
    sumOfProgresses += e.progress;
  });

  // 3. القسمة على عدد الكورسات الصالحة فقط
  return (sumOfProgresses / validEnrollments.length).toFixed(3);
};

const generateLevelData = (progress = calcProgress()) => {
  // تحويل الـ string اللي طالع من toFixed لرقم عشان المقارنة
  const numericProgress = parseFloat(progress);

  const levels = [
    { min: 90, word: "متفوق", stars: "★★★★★" },
    { min: 75, word: "جيد جداً", stars: "★★★★☆" },
    { min: 50, word: "جيد", stars: "★★★☆☆" },
    { min: 25, word: "مقبول", stars: "★★☆☆☆" },
    { min: 0, word: "مبتدئ", stars: "★☆☆☆☆" },
  ];

  // البحث عن أول مستوى يحقق الشرط (من الأعلى للأقل)
  const currentLevel =
    levels.find((l) => numericProgress >= l.min) || levels[levels.length - 1];

  return {
    progress: numericProgress,
    word: currentLevel.word,
    stars: currentLevel.stars,
  };
};

let domEl = ``;
enrollmentInfo.forEach((enrollment) => {
  domEl += `<div class="course-card">
          <div class="image">
            <img
              src="${
                enrollment.course.cover
                  ? enrollment.course.cover
                  : enrollment.course.autoCover
              }"
              alt="${enrollment.course.title}: a very profisional course"
            />
          </div>

          <div class="course-info">
            <h4>${enrollment.course.title}</h4>
            <p>التقدم في الكورس</p>

            <div class="progress-container">
              <span class="progress-text">${Math.round(
                enrollment.progress
              )}%</span>
              <div class="progress-bar">
                <div class="progress" style="width: ${
                  enrollment.progress
                }%"></div>
              </div>
            </div>

            <button class="goto-course" course-id="${
              enrollment.course._id
            }">أكمل التعلم</button>
          </div>
        </div>`;
});

console.log(calcProgress());

level.textContent = generateLevelData().word;
levelStars.textContent = generateLevelData().stars;

const ifAdmin = String(userProfile.user.role).includes("admin");

if (!ifAdmin) {
  renderDom(myCoursesContainer, domEl, "أنت لم تشترك في أي كورسات");
} else {
  boxLevel.style.visibility = "hidden";

  renderDom(
    myCoursesContainer,
    `
    <div class="you-admin" style="
    background-color: #ffffff;
    border-right: 6px solid #2563eb;
    padding: 20px 25px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    max-width: 700px;
    // margin: 20px auto;
    direction: rtl;
    text-align: right;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
">
    <h2 style="
        color: #1e3a8a;
        font-size: 1.3rem;
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
    ">
        <span style="margin-left: 10px;"></span>
        أنت (admin) في الموقع تملك صلاحية الدخول لأي كورس
    </h2>
    
    <h4 style="
        color: #64748b;
        font-size: 1rem;
        font-weight: 400;
        margin: 0;
        line-height: 1.5;
    ">
        إذا أردت تسجيل مستواك في الكورسات 
        <a style="color: #2563eb; font-weight: bold; text-decoration: underline;" href="register.html">سجل كطالب</a>
    </h4>
</div>`
  );
}

window.addEventListener("click", (e) => {
  const elClicked = e.target;
  if (elClicked.classList.contains("goto-course")) {
    window.location = `course.html?course=${elClicked.getAttribute(
      "course-id"
    )}`;
  }
});
