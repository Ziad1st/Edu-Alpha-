const express = require("express");
const router = express.Router();
const { getAllTeatchers } = require("../controllers/teatchersControllers");

router.get("/", getAllTeatchers);

module.exports = router;
