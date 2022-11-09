const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");

const AdminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Please Enter User Name "],
    maxlength: [20, "Your Name cannot exceed 20 charachters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your Email"],
    maxlength: [40, "your name cannot exceed 40 charachters"],
    validate: [validator.isEmail, "Please Enter Valid Email Address"],
  },
  active: {
    default: false,
    type: Boolean,
  },
  password: {
    type: String,
    required: [true, "Please enter your Password"],
    minlength: [8, "your password cannot be less than 8 characters"],
    select: false,
    validate: {
      validator: function (v) {
        return /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/.test(
          v
        );
      },
      message: (props) => `${props.value} is not a Strong Password!`,
    },
  },
  avatar: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 6);
});
AdminSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
AdminSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};
module.exports = mongoose.model("Admin", AdminSchema);
