const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const getAllTeatchers = asyncHandler(async (req, res) => {
  const teatchers = await User.find({ role: { $in: ["teatcher"] } }).select(
    "fullname image specialization coursesIHadCreated teatcherRating"
  );
  res.status(200).json(teatchers);
});

module.exports = {
  getAllTeatchers,
};
