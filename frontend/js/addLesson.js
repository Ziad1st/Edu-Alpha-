import { errorMessageHandler } from "./utils/errorMessage.js";
import { smartFetch } from "./utils/fetchWithRefToken.js"; // تأكد من المسار الصحيح
// ===============================
// 0) DOM Elements
// ===============================
const addLessonForm = document.getElementById("addLessonForm");
const videoInput = document.getElementById("video");
const fileMsg = document.querySelector(".file-msg");
const submitBtn = document.querySelector(".submit-btn");
const progressBar = document.querySelector(".progress-bar");

// ===============================
// 1) Preview اسم الملف
// ===============================
videoInput.addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length > 0) {
    fileMsg.innerText = `تم اختيار: ${e.target.files[0].name}`;
    fileMsg.style.color = "#2563eb";
  } else {
    fileMsg.innerText = "";
  }
});

// ===============================
// 2) دالة الرفع (Binary Upload)
// ===============================
// ملاحظة: الـ XHR لا يستخدم smartFetch تلقائياً، ولكن بما أنك ترفع فيديو كبير
// فالأفضل ترك منطق الـ Retry بداخلها بشكل مبسط باستخدام التوكن الجديد
function uploadVideoBinary(file, lessonId) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "PATCH",
      `https://edu-alpha-neon.vercel.app/api/lessons/upload-video/${lessonId}`,
      true
    );

    // نأخذ التوكن الأحدث الموجود في الـ localStorage (الذي قد تكون حدثته smartFetch)
    const token = localStorage.getItem("accessToken");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    const videoData = new FormData();
    videoData.append("video", file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && progressBar) {
        const percent = Math.round((e.loaded / e.total) * 100);
        progressBar.style.width = percent + "%";
        progressBar.innerText = percent + "%";
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        const errorMsg = JSON.parse(
          xhr.responseText || '{"message":"خطأ في الرفع"}'
        );
        reject(errorMsg);
      }
    };

    xhr.onerror = () => reject({ message: "فشل الاتصال بالسيرفر" });
    xhr.send(videoData);
  });
}

// ===============================
// 3) Submit Handler
// ===============================
addLessonForm.addEventListener("submit", async function handleSubmit(e) {
  if (e) e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("course");

  const videoFile = videoInput.files[0];
  if (!videoFile) return errorMessageHandler("❌ يرجى اختيار فيديو");

  const lessonData = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    order: document.getElementById("order").value,
    isFree: document.getElementById("isFree")?.checked || false,
    courseId: courseId,
  };

  try {
    submitBtn.disabled = true;
    submitBtn.innerText = "جاري إنشاء الدرس...";

    // المرحلة الأولى: إنشاء الدرس باستخدام الدالة الذكية
    // smartFetch ستتولى الـ Refresh تلقائياً إذا أعاد السيرفر 401
    let res = await smartFetch("https://edu-alpha-neon.vercel.app/api/lessons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lessonData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشل إنشاء الدرس");

    // المرحلة الثانية: رفع الفيديو
    submitBtn.innerText = "جاري رفع الفيديو...";
    await uploadVideoBinary(videoFile, data.lessonId);

    alert("✅ تم الرفع بنجاح");
    window.location.href = `course.html?course=${courseId}`;
  } catch (error) {
    errorMessageHandler(error.message);
    resetUI();
  }
});

function resetUI() {
  if (progressBar) {
    progressBar.style.width = "0%";
    progressBar.innerText = "";
  }
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerText = "رفع الدرس الآن";
  }
}
