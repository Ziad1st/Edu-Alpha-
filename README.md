# 🚀 Edu Alpha - Educational Management System

**Edu Alpha** هي منصة تعليمية متكاملة تهدف إلى تمكين المعلمين من إدارة دوراتهم التدريبية ورفع المحتوى المرئي بسهولة، مع تجربة مستخدم سلسة للطلاب. تم تطوير المنصة باستخدام تقنيات حديثة لضمان الأداء العالي وحل مشاكل رفع الملفات الكبيرة.

---
(LIVE LINK) - see the website here
https://edu-alpha-frontend.vercel.app/pages/courses.html

## ✨ الميزات الرئيسية (Features)

* **نظام إدارة الفيديوهات**: تكامل كامل مع **Cloudinary API** لرفع الفيديوهات من الجهة الأمامية (Frontend) مباشرة لتجاوز قيود حجم السيرفر.
* **مشغل فيديو احترافي**: استخدام Cloudinary Video Player لتوفير تجربة مشاهدة مخصصة ومنع التحميل غير المصرح به.
* **لوحة تحكم للمعلم**: إمكانية إنشاء الكورسات، إضافة الدروس، وتتبع حالة الرفع عبر شريط تقدم (Progress Bar) تفاعلي.
* **نظام متابعة الطلاب**: تتبع الدروس المكتملة وحساب النسبة المئوية للتقدم في الكورس.
* **تصميم متجاوب (Responsive)**: واجهة مستخدم تتكيف مع جميع أحجام الشاشات (Desktop, Tablet, Mobile) باستخدام CSS Grid و Media Queries.
* **الأمان**: نظام مصادقة مستخدمين (Authentication) باستخدام JWT مع توفير حماية للمسارات (Route Protection).

---

## 🛠 التقنيات المستخدمة (Tech Stack)

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- Cloudinary SDK (لإدارة الوسائط)
- JWT (للمصادقة والأمان)

**Frontend:**
- HTML5, CSS3 (Custom Grid System)
- Vanilla JavaScript (ES6+)
- Cloudinary Video Player Library

---

## 🚀 التشغيل المحلي (Getting Started)

### المتطلبات (Prerequisites)
- Node.js مثبت على جهازك.
- حساب على [Cloudinary](https://cloudinary.com/).

### الخطوات
1. قم بتحميل المشروع (Clone):
   ```bash
   git clone [https://github.com/your-username/edu-alpha.git](https://github.com/your-username/edu-alpha.git)

   cd backend && npm install

---
   PORT=5000
   
   MONGO_URI=your_mongodb_uri
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   
   CLOUDINARY_API_KEY=your_api_key
   
   CLOUDINARY_API_SECRET=your_api_secret
   
   JWT_SECRET=your_secret_key
   
   npm start
---
