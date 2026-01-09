const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");

const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    fullname,
    role,
    image,
    specialization,
    aboutTeatcher,
  } = req.body;
  const errMessages = [
    "لازم يتم ملئ جميع البيانات",
    "هذا الـ (Email) مجود بالفعل",
  ];
  if (!email || !password || !fullname)
    res.status(400).json({ message: errMessages[0] });

  if (await User.findOne({ email })) throw new ApiError(errMessages[1], 400);

  const hashedPassword = await bcrypt.hash(password, 10);

  const userDataToDB = () => {
    if (role && specialization) {
      return {
        email,
        password: hashedPassword,
        fullname,
        role,
        specialization,
        aboutTeatcher,
      };
    } else {
      return {
        email,
        password: hashedPassword,
        fullname,
      };
    }
  };

  const user = await User.create(userDataToDB());

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.status(201).json({
    status: "registered Successfully",
    accessToken: accessToken,
    role: user.role,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const errMessage =
    "خطأ في الـ(email) او الـ(password) تأكد من صحة بيانات الحساب";

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(errMessage, 400);

  if (!(await bcrypt.compare(password, user.password)))
    throw new ApiError(errMessage, 400);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res
    .status(200)
    .json({ status: "login Successful", accessToken, role: user.role });
});

const refresh = asyncHandler(async (req, res) => {
  const cookies = req?.cookies;
  const errorMessage = [
    "لا تملك الصلاحية لهذا الإجراء",
    "تحذير،لا تحاول التلاعب بالموقع حتى لا تُحظر منه!!!",
  ];
  if (!cookies?.jwt) throw new ApiError(errorMessage[0], 401);

  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });

  if (!user) throw new ApiError(errorMessage[1], 403);

  const accessToken = generateAccessToken(user);

  res.status(200).json({
    status: "token refreshed Successfully",
    accessToken,
    role: user.role,
  });
});
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("jwt");
  const userId = req.body._id;
  const user = await User.findById(userId);
  user.refreshToken = "";
  await user.save();
  res.status(200).json("تم تسجيل الخروج بنجاح");
});

module.exports = {
  register,
  login,
  refresh,
  logout,
};
