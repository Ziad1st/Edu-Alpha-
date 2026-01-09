const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      email: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: Array,
      default: ["student"],
    },
    refreshToken: {
      type: String,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    image: {
      type: String,
    },
    aboutTeatcher: {
      type: String,
    },
    coursesIHadCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    specialization: {
      type: Array,
      default: ["none"],
    },
    teatcherRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", function () {
  // تأكد إن fullname موجود عشان encodeURIComponent ما تضربش
  if (this.fullname && (this.isModified("fullname") || !this.image)) {
    const name = encodeURIComponent(this.fullname);

    this.image = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=500`;
  }
});

module.exports = mongoose.model("User", UserSchema);
