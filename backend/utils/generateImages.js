const { createCanvas, registerFont } = require("canvas");
const path = require("path");
registerFont(path.join(__dirname, ".." ,"fonts", "Cairo-Bold.ttf"), {
  family: "Cairo",
});
const generateCategoryCover = (categoryName) => {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. مصفوفة الألوان الاحترافية (تم تحسين الدرجات لتكون أكثر فخامة)
  const gradients = [
    ["#0f172a", "#1e40af"],
    ["#1e293b", "#334155"],
    ["#064e3b", "#059669"],
    ["#1e3a8a", "#2563eb"],
    ["#1e1b4b", "#4338ca"],
    ["#0f172a", "#0891b2"],
  ];

  const charSum = categoryName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selectedColors = gradients[charSum % gradients.length];

  // 2. رسم الخلفية الأساسية
  ctx.fillStyle = selectedColors[0];
  ctx.fillRect(0, 0, width, height);

  // 3. إضافة "بقع ضوئية" (Mesh Gradient Effect)
  // بقعة ضوء في الزاوية العلوية
  const light1 = ctx.createRadialGradient(0, 0, 50, 200, 200, 400);
  light1.addColorStop(0, selectedColors[1] + "88"); // شفافية 50%
  light1.addColorStop(1, "transparent");
  ctx.fillStyle = light1;
  ctx.fillRect(0, 0, width, height);

  // 4. رسم أشكال هندسية تجريدية (Abstract Shapes)
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#ffffff";

  // دائرة كبيرة في الركن
  ctx.beginPath();
  ctx.arc(width - 100, height - 100, 200, 0, Math.PI * 2);
  ctx.fill();

  // مثلث أو شكل هندسي آخر
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(200, height - 200);
  ctx.lineTo(400, height);
  ctx.fill();
  ctx.restore();

  // 5. إضافة شبكة النقاط (Dots) لكن بشكل أرقى
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  for (let i = 40; i < width; i += 40) {
    for (let j = 40; j < height; j += 40) {
      ctx.beginPath();
      ctx.arc(i, j, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 6. رسم "Badge" صغير في الأعلى (مثل Udemy)
  const badgeText = "مسار تعليمي معتمد";
  ctx.font = "bold 14px system-ui";
  const badgeWidth = ctx.measureText(badgeText).width + 30;

  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.roundRect((width - badgeWidth) / 2, 80, badgeWidth, 30, 15);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillText(badgeText, width / 2, 95);

  // 7. رسم العنوان الرئيسي (Typography)
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 20;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // استخدام خط عريض جداً ونظيف
  ctx.font = "bold 50px Cairo";

  const maxWidth = width * 0.75;
  const words = categoryName.split(" ");
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    if (ctx.measureText(currentLine + " " + words[i]).width < maxWidth) {
      currentLine += " " + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);

  const lineHeight = 75;
  let startY = height / 2 - ((lines.length - 1) * lineHeight) / 2 + 20;

  lines.forEach((line, index) => {
    // رسم السطر مع تباعد احترافي
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });

  // 8. إضافة خط زخرفي تحت العنوان
  ctx.lineWidth = 4;
  ctx.strokeStyle = selectedColors[1];
  ctx.beginPath();
  ctx.moveTo(width / 2 - 50, startY + lines.length * lineHeight - 20);
  ctx.lineTo(width / 2 + 50, startY + lines.length * lineHeight - 20);
  ctx.stroke();

  return canvas.toDataURL("image/png");
};

module.exports = { generateCategoryCover };
