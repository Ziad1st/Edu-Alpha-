import { errorMessageHandler } from "./utils/errorMessage.js";
import { renderDom } from "./utils/renderDom.js";
import { contentLoad } from "./utils/contentLoading.js";
const courseForm = document.getElementById("course-form");

const fetchCategories = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
    errorMessageHandler(error.message, "on");
    return [];
  }
};

const categoriesListEl = document.getElementById("category");
window.addEventListener("load", async () => {
  contentLoad("on");

  /**@type {Array} */
  let categories = await fetchCategories(
    "https://edu-alpha-neon.vercel.app/api/categories/getAll"
  );

  let domEl = ``;
  categories.forEach((category) => {
    domEl += `<option value="${category._id}">${category.name}</option>`;
  });

  renderDom(categoriesListEl, domEl);
  contentLoad("off");
});

courseForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // منع السلوك الافتراضي للمتصفح (أهم سطر)
  e.stopPropagation(); // منع انتقال الحدث للعناصر الأب
  const formData = new FormData(courseForm);

  const token = localStorage.getItem("accessToken");

  const courseData = {
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
  };

  if (formData.get("cover")) {
    courseData.cover = formData.get("cover");
  }

  try {
    const response = await fetch(
      "https://edu-alpha-neon.vercel.app/api/courses/createOne",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      }
    );

    // تأكد أن السيرفر أرسل رداً قبل محاولة قراءة الـ JSON
    if (response.ok) {
      const result = await response.json();
      alert("✅ " + result.message);
      console.log(result);
      // توجيه المستخدم لصفحة إضافة الدروس مع تمرير الـ ID الجديد
      window.location.href = `add-lesson.html?course=${result.course._id}`;
    } else {
      const errorText = await response.text();
      throw new Error(errorText || "حدث خطأ في السيرفر");
    }
  } catch (error) {
    // إذا كان الكورس بيتعمل فعلاً، فالخطأ غالباً هنا في الشبكة أو الـ CORS

    if (error.message === "Failed to fetch") {
      errorMessageHandler(
        "⚠️ الكورس أُنشئ غالباً لكن هناك مشكلة في استلام تأكيد السيرفر (CORS)."
      );
      setTimeout(() => {
        window.location.href = "courses.html";
      }, 2000);
    } else {
      console.log(error.message.split(":")[1].split('"')[1]);

      errorMessageHandler(
        error.message.split(":")[1].split('"')[1] || "خطأ في الإجراء حاول مجددا"
      );
    }
  }
});
