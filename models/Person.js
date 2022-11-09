const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");

const PersonSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Please Enter User Name "],
    maxlength: [20, "Your Name cannot exceed 20 charachters"],
    unique: [true, "this user name is already taken"],
  },

  email: {
    type: String,
    required: [true, "Please enter your Email"],
    maxlength: [40, "your name cannot exceed 40 charachters"],
    unique: true,
    validate: [validator.isEmail, "Please Enter Valid Email Address"],
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
  updatedAt: {
    type: Date,
  },
  active: {
    default: false,
    type: Boolean,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});
PersonSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 6);
});
PersonSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};
PersonSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
PersonSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("Person", PersonSchema);
