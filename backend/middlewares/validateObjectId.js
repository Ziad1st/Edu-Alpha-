const mongoose = require("mongoose");

module.exports = (req, res, next) => {
  const ObjectId = req.params?.id;
  if (!mongoose.Types.ObjectId.isValid(ObjectId))
    return res.status(400).json({ message: "Invalid ID" });
  next();
};
