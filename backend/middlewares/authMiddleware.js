const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

module.exports = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;

  console.log("start");
  if (!auth?.startsWith("Bearer "))
    throw new ApiError("يرجى تسجيل الدخول أولا", 401);

  console.log("middle");

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("ended => authMiddleware");

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "jwt expired" }); // هذا ما ينتظره الفرونت إند
    }
    return res.status(401).json({ message: "توكن غير صالح" });
  }
};
