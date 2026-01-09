const express = require("express");
const router = express.Router();

const verifyRoles = require("../middlewares/verifyRoles");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  enrollmentController,
  confirmPayment,
} = require("../controllers/enrollmentControllers");

router.post(
  "/add",
  authMiddleware,
  verifyRoles("student"),
  enrollmentController
);
router.post(
  "/confirm-payment",
  authMiddleware,
  verifyRoles("student"),
  confirmPayment
);

module.exports = router;
