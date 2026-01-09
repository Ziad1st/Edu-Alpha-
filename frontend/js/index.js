const categoriesContainer = document.getElementById(
  "courses-categories-container"
);
const menuUl = document.querySelector(".menu ul");
import { contentLoad } from "./utils/contentLoading.js";
import { renderDom } from "./utils/renderDom.js";

contentLoad("on");

const fetchCategories = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};
window.addEventListener("load", async () => {
  /**@type {Array} */
  const categories = await fetchCategories(
    "http://localhost:5000/api/categories/getAll"
  );

  let domEl = ``;
  let menuDomEl = ``;

  categories.forEach((category) => {
    domEl += `
    <div class="card">
        <div class="image">
          <img
            loading="lazy"
            src="${category.cover}"
            alt="${category.name}"
          />
        </div>
        <h4 class="title">${category.name}</h4>
        <h3 class="courses-count">${category.coursesCount} <span>كورسات</span></h3>
        <p>${category.description}</p>
        <button category-id="${category._id}" class="goto-catigory">ابدأ</button>
      </div>
            `;
    menuDomEl += `
          <li><a href="courses.html?category=${category._id}">${category.name}</a></li>

            `;
  });

  renderDom(categoriesContainer, domEl);
  renderDom(menuUl, menuDomEl);
  contentLoad("off");
});

window.addEventListener("click", (e) => {
  if (e.target.className == "goto-catigory") {
    const categoryId = e.target.attributes["category-id"].value;
    window.location = `courses.html?category=${categoryId}`;
  }
});
