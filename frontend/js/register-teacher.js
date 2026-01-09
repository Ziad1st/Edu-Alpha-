const ApiUrl = `http://localhost:5000/api/auth/register`; // تأكد من المسار في السيرفر
const form = document.getElementById("register-form");
import { errorMessageHandler } from "./utils/errorMessage.js";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // جمع البيانات من الحقول الجديدة
  const fullname = form.querySelector("#name").value;
  const email = form.querySelector("#email").value;
  const specialization = form.querySelector("#specialization").value; // حقل التخصص
  const aboutTeatcher = form.querySelector("#experience").value; // حقل النبذة (aboutTeatcher)
  const password = form.querySelector("#password").value;
  const confirmPassword = form.querySelector("#confirm-password").value;

  try {
    // 1. التحقق من تطابق كلمة المرور
    if (password !== confirmPassword) {
      throw new Error("❌ خطأ في كلمة المرور، تأكد من تطابق كلمتي المرور");
    }

    // 2. إرسال الطلب للسيرفر مع الحقول الجديدة
    const res = await fetch(ApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        fullname,
        specialization, // تم الإضافة
        aboutTeatcher,
        role: ["student", "teatcher"], // تم الإضافة (النبذة)
      }),
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "خطأ في التسجيل، حاول في وقت لاحق");
    }

    const data = await res.json();
    console.log("Success:", data);

    // 3. تخزين البيانات في LocalStorage
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("role", data.role);

    // 4. توجيه المستخدم (ممكن توجهه لصفحة انتظار الموافقة أو صفحة الكورسات)
    alert("تم إرسال طلب الانضمام بنجاح! سيتم مراجعة حسابك.");
    window.location = "courses.html";
  } catch (error) {
    errorMessageHandler(
      error.message === "Failed to fetch"
        ? "مشكلة في الإتصال تأكد من الشبكة"
        : error.message
    );
  }
});
