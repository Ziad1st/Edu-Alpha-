export function contentLoad(status = "on") {
  // نحاول الإمساك بالعنصر من الصفحة في كل مرة
  let el = document.getElementById("load");

  if (status === "on") {
    // 1. إذا لم يكن العنصر موجوداً، ننشئه فوراً
    if (!el) {
      el = document.createElement("div");
      el.id = "load";
      el.className = "load";
      document.body.appendChild(el);
    }

    // 2. إظهار اللودنج
    document.body.style.overflowY = "hidden";
    el.innerHTML = `
      <div class="content-loading">
        <img src="../assets/images/loading-page.svg" alt="loading..." />
      </div>`;
  } else if (status === "off") {
    // 3. الإغلاق بأمان: نتحقق أولاً هل العنصر موجود أم لا
    if (el) {
      document.body.style.overflowY = "auto";
      el.remove();
    }
  }
}
