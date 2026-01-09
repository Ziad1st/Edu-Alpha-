const {
  login,
  register,
  refresh,
  logout,
} = require("../controllers/authCotrollers");
const express = require("express");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);

module.exports = router;
