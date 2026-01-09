const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const corsOptions = {
  origin: function (origin, callback) {
    // قائمة الروابط المسموح لها بالوصول
    const allowedOrigins = [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://edu-alpha-frontend.vercel.app", // ضع رابط الـ Frontend الخاص بك هنا بعد الرفع
    ];

    // السماح بالطلبات التي ليس لها origin (مثل تطبيقات الموبايل أو Postman)
    // أو إذا كان الـ origin موجوداً في القائمة
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

// 2. جعل مجلد الرفع متاحاً للوصول العام (Static)
//>> G Middlewares
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//>> Routes
app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "views", "welcome.html"));
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoriesRoute"));
app.use("/api/courses", require("./routes/coursesRoutes"));
app.use("/api/lessons", require("./routes/lessonsRoutes"));
app.use("/api/teatchers", require("./routes/teatchersRoute"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/enrollments", require("./routes/enrollmentRoutes"));

//>> 404 Handler
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

//>> G Error Handler
app.use((err, req, res, next) => {
  console.log(err.message);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

module.exports = app;
