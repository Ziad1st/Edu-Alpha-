const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const addCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  let categoryData = { name, description };

  if (await Category.findOne({ $or: [{ name }, { description }] })) {
    throw new ApiError("category exists allready", 400);
  }

  // إذا قام المستخدم برفع صورة، نخزن مسارها
  if (req.file) {
    categoryData.customCover = `/uploads/categories/${req.file.filename}`;
  }

  const category = new Category(categoryData);
  await category.save();

  res.status(201).json(category);
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .populate("coursesCount")
    .sort({ name: 1 });
  res.status(200).json(categories);
});

module.exports = { addCategory, getCategories };
