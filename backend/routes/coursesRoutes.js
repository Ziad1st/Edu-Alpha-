const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  getCoursesCategory,
  getCoursesByTeatcher,
} = require("../controllers/coursesControllers");
const verifyRoles = require("../middlewares/verifyRoles");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/createOne",
  authMiddleware,
  verifyRoles("teatcher admin"),
  createCourse
);
router.get("/getAll", getAllCourses);
router.get("/category/:id", getCoursesCategory);
router.get("/getOne/:id", getCourseById);
router.get("/teatcher/:id", getCoursesByTeatcher);


module.exports = router;
