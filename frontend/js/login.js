const ApiUrl = `http://localhost:5000/api/auth/login`;
const form = document.getElementById("login-form");
import { errorMessageHandler } from "./utils/errorMessage.js";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = form.querySelector("#email").value;
  const password = form.querySelector("#password").value;

  try {
    const res = await fetch(ApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
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
