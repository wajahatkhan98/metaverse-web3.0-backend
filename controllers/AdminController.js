const AdminScehma = require("../models/Admin");
const catchAsyncErrors = require("../middlewares/catchAsyncError");
const PersonSchema = require("../models/Person");
const sendEmail = require("../utils/sendEmail");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const forgotEmail = require("../utils/forgotEmail");

exports.mailAllUsers = catchAsyncErrors(async (req, res, next) => {
  const allPeople = await PersonSchema.find();
  const mailList = allPeople.map((person) => person.email);
  res.status(200).json({
    success: true,
    message: "will be implemented",
  });
});

// security will be added
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const allPeople = await PersonSchema.find();
  res.status(200).json({
    success: true,
    list: allPeople,
  });
});

// Adding Admin ;Confirmation will be performed,
exports.addAdmin = catchAsyncErrors(async (req, res, next) => {
  const { userName, email, password } = req.body;
  if (userName == undefined || email == undefined || password == undefined) {
    res.status(400).json({
      success: false,
      message: "please enter all the data",
    });
    return;
  }
  const adminCreated = await AdminScehma.create({
    userName,
    email,
    password,
  });

  const resetToken = adminCreated.getResetPasswordToken();
  await adminCreated.save({ validateBeforeSave: false });

  // console.log("person created ");
  // Create reset password url
  const verifyURL = `${req.protocol}://${req.get(
    "host"
  )}/verifyAdmin/?token=${resetToken}&userName=${userName}`;

  try {
    // console.log("In email ");

    await sendEmail({
      userName: userName,
      email: email,
      subject: "Account Verification Through Email",
      verifyURL,
    });

    res.status(200).json({
      success: true,
      message: `Verification Email has been sent to: ${email}, please Check your in inbox or spam `,
    });
    console.log(`Email sent to: ${email}`);
    // console.log("person created ");
  } catch (error) {
    console.log("error in email", error);
    adminCreated.resetPasswordToken = undefined;
    adminCreated.resetPasswordExpire = undefined;
    await adminCreated.save({ validateBeforeSave: false });

    console.log("In Error");

    return next(new ErrorHandler(error.message, 500));
  }
});
exports.activateAdmin = catchAsyncErrors(async (req, res, next) => {
  const { token, email } = req.query;
  // res.send(token)

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  console.log(resetPasswordToken);

  const user = await AdminScehma.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    res.render("tokenExpired");
  } else {
    user.active = true;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.render("registeredSuccess", {
      redirectURL: process.env.FRONT_END_URL,
    });
  }
});

exports.loginAdmin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorHandler("Please enter a valid email address and password", 400)
    );
  }
  const user = await AdminScehma.findOne({ email }).select("+password");
  if (!user) {
    console.log("email", email);

    return next(new ErrorHandler("Invalid email and password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    console.log("password", password);
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  if (user.active) {
    sendToken(user, 200, res, "Login Successfully");
  } else {
    return next(
      new ErrorHandler(
        "Admin account is not activated yet, Activate account to Use GameRee Platform",
        401
      )
    );
  }
});

////////////////////////
exports.logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Log out",
  });
});

exports.deleteAll = catchAsyncErrors(async (req, res, next) => {
  if (deletedBy != "haseeb" || deletedBy != "shaikh" || deletedBy != "arooj") {
    return next(new ErrorHandler("Unauthorized Access", 401));
  }

  await PersonSchema.deleteMany({});
  console.log(`Users are Deleted by  ${deletedBy}`);
  res.status(200).json({
    success: true,
    message: "deleted all Users",
  });
});

exports.deleteUserByEmail = catchAsyncErrors(async (req, res, next) => {
  const { email, deletedBy } = req.body;
  if (!email) {
    return next(new ErrorHandler("Please enter Email", 400));
  }
  if (deletedBy == "haseeb" || deletedBy == "shaikh" || deletedBy == "arooj") {
    const foundPerson = await PersonSchema.find({ email: email });
    if (foundPerson[0]) {
      await PersonSchema.findByIdAndDelete(foundPerson[0]._id);
      res.status(200).json({
        message: "User has been Deleted ",
      });
    } else {
      return next(new ErrorHandler("Person Not Found", 404));
    }
  } else return next(new ErrorHandler("UnAuthorized Access", 401));
});
