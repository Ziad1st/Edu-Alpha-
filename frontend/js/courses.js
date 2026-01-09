const coursesContainer = document.querySelector(".courses-container");
import { renderDom } from "./utils/renderDom.js";
import { contentLoad } from "./utils/contentLoading.js";
import { errorMessageHandler } from "./utils/errorMessage.js";

const startsRate = (rating) => {
  const rateStars = ["☆☆☆☆☆", "☆☆☆☆★", "☆☆☆★★", "☆☆★★★", "☆★★★★", "★★★★★"];

  return rateStars[Math.round(rating)];
};

const fetchURL = "";

const fetchCourses = async (url = fetchURL) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    /**@type {Array} */
    return data;
  } catch (error) {
    errorMessageHandler(error.message, "on");
    return [];
  }
};

window.addEventListener("load", async (e) => {
  const searchVal = window.location.search.split("=")[1];
  let domEl = ``;
  let courses;
  contentLoad("on");
  if (window.location.search.includes("category")) {
    courses = await fetchCourses(
      `https://edu-alpha-neon.vercel.app/api/courses/category/${searchVal}`
    );
  } else if (window.location.search.includes("teatcher")) {
    courses = await fetchCourses(
      `https://edu-alpha-neon.vercel.app/api/courses/teatcher/${searchVal}`
    );
  } else {
    courses = await fetchCourses(
      `https://edu-alpha-neon.vercel.app/api/courses/getAll`
    );
  }

  courses.forEach((course) => {
    let { title, description, cover, teatcher, price, rating, catigory, _id } =
      course;
    const courseCard = `
      <div course-id="${_id}" class="card">
        <div class="course-cover">
          <img loading="lazy"
            src="${course.autoCover ? course.autoCover : cover}"
            alt="${title}"
          />
        </div>

        <div class="flex">
          <h4>${title}</h4>
          <p class="rating">${startsRate(rating)}</p>
        </div>
        <p class="tooltip-text" data-hover="${
          description.length > 500
            ? String(description).slice(1, 500) + "..."
            : description
        }">${
      description.length > 100
        ? String(description).slice(1, 100) + "..."
        : description
    }</p>
        <p class="teacher">المعلم: أ. ${teatcher.fullname}</p>
        <p class="price">السعر: ${price} ج</p>
        <button class="goto-course">ابدأ</button>
      </div>
    `;
    domEl += courseCard;
  });

  renderDom(coursesContainer, domEl);
  contentLoad("off");
});

window.addEventListener("click", (e) => {
  const itemClicked = e.target;
  if (itemClicked.className == "goto-course") {
    const courseId = itemClicked.parentElement.getAttribute("course-id");
    window.location = `course.html?course=${courseId}`;
  }
});
