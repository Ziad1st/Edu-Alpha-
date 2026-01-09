const express = require("express");
const router = express.Router();

const verifyRoles = require("../middlewares/verifyRoles");
const {
  addCategory,
  getCategories,
} = require("../controllers/categoriesControllers");

router.post(
  "/addOne",
  require("../middlewares/authMiddleware"),
  verifyRoles("student"),
  addCategory
);

router.get("/getAll", getCategories);

module.exports = router;
