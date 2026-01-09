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
// 2) دالة الرفع لـ Cloudinary (باستخدام XHR لتشغيل الشريط)
// ===============================
function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const cloudName = "daaxlwz06";
    const uploadPreset = "xi2flf4u";

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      true
    );

    // --- الجزء المسؤول عن تحريك الشريط ---
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && progressBar) {
        const percent = Math.round((e.loaded / e.total) * 100);
        progressBar.style.width = percent + "%";
        progressBar.innerText = percent + "%";
      }
    };

    xhr.onload = () => {
      const response = JSON.parse(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response.secure_url); // نرجع رابط الفيديو
      } else {
        reject(
          new Error(response.error?.message || "فشل رفع الفيديو لـ Cloudinary")
        );
      }
    };

    xhr.onerror = () => reject(new Error("فشل الاتصال بـ Cloudinary"));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    xhr.send(formData);
  });
}

// ===============================
// 3) Submit Handler (المعدل)
// ===============================
addLessonForm.addEventListener("submit", async function handleSubmit(e) {
  if (e) e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("course");

  const videoFile = videoInput.files[0];
  if (!videoFile) return errorMessageHandler("❌ يرجى اختيار فيديو");

  try {
    submitBtn.disabled = true;
    submitBtn.innerText = "جاري رفع الفيديو لـ Cloudinary...";

    // المرحلة الأولى: رفع الفيديو لـ Cloudinary والحصول على الرابط
    // ملاحظة: يمكنك هنا تحديث الـ ProgressBar يدوياً إذا استخدمت XMLHttpRequest للرفع لـ Cloudinary
    const videoURL = await uploadToCloudinary(videoFile);

    // المرحلة الثانية: إرسال رابط الفيديو مع بيانات الدرس للباك-إند
    submitBtn.innerText = "جاري حفظ بيانات الدرس...";

    const lessonData = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      order: document.getElementById("order").value,
      isFree: document.getElementById("isFree")?.checked || false,
      courseId: courseId,
      videoUrl: videoURL, // 👈 نرسل الرابط هنا بدلاً من رفعه لاحقاً
    };

    let res = await smartFetch("http://localhost:5000/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lessonData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشل إنشاء الدرس");

    alert("✅ تم الرفع والحفظ بنجاح");
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
