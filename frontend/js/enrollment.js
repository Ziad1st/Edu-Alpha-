import { contentLoad } from "./utils/contentLoading.js";
import { errorMessageHandler } from "./utils/errorMessage.js";
import { smartFetch } from "./utils/fetchWithRefToken.js";

// داخل ملف الـ JS الخاص بصفحة الكورس
const enrollBtn = document.querySelector(".enroll-btn"); // تأكد من الـ class الصحيح

enrollBtn.addEventListener("click", async (e) => {
  try {
    contentLoad("on");
    const courseId = new URLSearchParams(window.location.search).get("course");

    const response = await smartFetch(
      `https://edu-alpha-neon.vercel.app/api/enrollments/add`,
      {
        method: "POST",
        body: JSON.stringify({ courseId }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert("✅تم الاشتراك بنجاح");
      window.location.reload(); // لإعادة تحميل الصفحة وتغيير حالة الأزرار
    } else {
      errorMessageHandler(result.message, "on");
    }
  } catch (error) {
    console.error(error);
    errorMessageHandler("فشل الاتصال بالسيرفر", "on");
  } finally {
    contentLoad("off");
  }
});
