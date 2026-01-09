const express = require("express");
const router = express.Router();

const {
  getMyCourses,
  getUserProfile,
  getEnrollmentByCourseId,
} = require("../controllers/userControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/myCourses", authMiddleware, getMyCourses);
router.get("/myProfile", authMiddleware, getUserProfile);
router.get("/getEnrollment/:id", authMiddleware, getEnrollmentByCourseId);

module.exports = router;
