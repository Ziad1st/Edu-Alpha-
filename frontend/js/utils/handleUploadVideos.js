export const handleUpload = async () => {
  const formData = new FormData();
  formData.append("title", "مقدمة الكورس");
  formData.append("courseId", "ID_الكورس_هنا");
  formData.append("video", videoFile); // ملف الفيديو من الـ input

  const res = await fetch("/api/lessons/upload", {
    method: "POST",
    body: formData, // لا تضع Headers هنا، المتصفح سيتعامل معها
  });

  const result = await res.json();
  console.log(result);
};
