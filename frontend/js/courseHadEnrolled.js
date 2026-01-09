// في ملف courseHadEnrolled.js
import { userProfile } from "./utils/getUserProfile.js";

// نستخدم Optional Chaining (?) للتأكد من أن البيانات ليست null
/**@type {Array} */
let userCourses = (await userProfile?.user?.courses) || [];
/**@type {Array} */
let userCreatedCourses = (await userProfile?.user?.coursesIHadCreated) || [];

console.log(userProfile);

const params = new URLSearchParams(window.location.search);
const courseId = params.get("course"); // طريقة أدق من split

export const courseEnrolledCheker = (course = courseId) => {
  if (userCourses.findIndex((e) => e._id == course) !== -1) {
    console.log("enrolled");
    return { status: true, role: "student" };
  } else if (userProfile.user.role.findIndex((e) => e == "admin") !== -1) {
    console.log("admin");
    return { status: true, role: "student teatcher admin".split(" ") };
  } else if (userCreatedCourses.findIndex((e) => e._id == course) !== -1) {
    console.log("teatcher");
    return { status: true, role: "teatcher" };
  } else {
    return { status: false, role: userProfile.user.role };
  }
};

console.log(courseEnrolledCheker);
export const enrollChecker = courseEnrolledCheker();
