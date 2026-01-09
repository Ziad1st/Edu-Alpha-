const ApiUrl = `https://edu-alpha-neon.vercel.app/api/auth/register`;
const form = document.getElementById("register-form");
import { errorMessageHandler } from "./utils/errorMessage.js";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fullname = form.querySelector("#name").value;
  const email = form.querySelector("#email").value;
  const password = form.querySelector("#password").value;
  const confirmPassword = form.querySelector("#confirm-password").value;

  try {
    if (password !== confirmPassword) {
      throw new Error("❌ خطأ في كلمة المرور، تأكد من تطابق كلمتي المرور");
    }
    const res = await fetch(ApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, fullname, confirmPassword }),
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "خطأ في التسجيل, حاول في وقت لاحق");
    }

    const data = await res.json();
    console.log(data);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("role", data.role);

    window.location = "courses.html";
  } catch (error) {
    errorMessageHandler(
      error.message == "Failed to fetch"
        ? "مشكلة في الإتصال تأكد من الشبكة"
        : error.message
    );
  }
});
