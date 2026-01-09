const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  const { _id, role } = user;
  const secretKey = process.env.JWT_SECRET;

  return jwt.sign({ userData: { _id, role } }, secretKey, { expiresIn: "15m" });
};
const generateRefreshToken = (user) => {
  const { _id, role } = user;
  const secretKey = process.env.REFRESH_TOKEN_SECRET;

  return jwt.sign({ userData: { _id, role } }, secretKey, { expiresIn: "7d" });
};

module.exports = { generateAccessToken, generateRefreshToken };
