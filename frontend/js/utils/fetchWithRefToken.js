export const smartFetch = async (url, options = {}) => {
  let token = localStorage.getItem("accessToken");

  // إضافة الـ Header تلقائياً
  options.headers = {
    ...options.headers,
    authorization: `Bearer ${token}`,
  };

  let response = await fetch(url, options);

  // إذا انتهت صلاحية التوكن
  if (response.status === 401) {
    // نطلب توكن جديد من مسار الـ refresh
    const refreshRes = await fetch(
      "https://edu-alpha-neon.vercel.app/api/auth/refresh",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("accessToken", data.accessToken);

      // إعادة محاولة الطلب الأصلي بالتوكن الجديد
      options.headers["authorization"] = `Bearer ${data.accessToken}`;
      return await fetch(url, options);
    } else {
      // إذا فشل الـ Refresh أيضاً، اخرج فوراً
      window.location.href = "login.html";
    }
  }
  return response;
};
