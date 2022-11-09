const PersonSchema = require("../models/Person");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const forgotEmail = require("../utils/forgotEmail");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//////////////////
exports.testMail = catchAsyncErrors(async (req, res, next) => {
  const message = ` messsge`;
  try {
    await sendEmail({
      email: `hanif.team.dev@gmail.com`,
      subject: "Dot Project",
      message,
    });

    res.status(200).json({
      ok: 1,
    });
  } catch (e) {
    res.status(200).json({
      ok: e,
    });
  }
});

//////////////////////
exports.deleteAll = catchAsyncErrors(async (req, res, next) => {
  await PersonSchema.deleteMany({});

  res.status(200).json({
    success: true,
    message: "deleted all ",
  });
});

//////////////////////////
exports.addPerson = catchAsyncErrors(async (req, res, next) => {
  const { userName, email, password } = req.body;
  if (userName == undefined || email == undefined || password == undefined) {
    res.status(400).json({
      success: false,
      message: "please enter all the data",
    });
    return;
  }
  const personCreated = await PersonSchema.create({
    userName,
    email,
    password,
  });

  const resetToken = personCreated.getResetPasswordToken();
  await personCreated.save({ validateBeforeSave: false });

  // console.log("person created ");
  // Create reset password url
  const verifyURL = `${req.protocol}://${req.get(
    "host"
  )}/verifyUser/?token=${resetToken}&userName=${userName}`;

  try {
    // console.log("In email ");

    await sendEmail({
      userName: userName,
      email: email,
      subject: "Account Verification Through Email",
      verifyURL,
    });

    //   sendToken(personCreated, 200, res);
    res.status(200).json({
      success: true,
      message: `Verification Email has been sent to: ${email}, please Check your in inbox or spam `,
    });
    console.log(`Email sent to: ${email}`);
    // console.log("person created ");
  } catch (error) {
    console.log("error in email", error);
    personCreated.resetPasswordToken = undefined;
    personCreated.resetPasswordExpire = undefined;
    await personCreated.save({ validateBeforeSave: false });

    console.log("In Error");

    return next(new ErrorHandler(error.message, 500));
  }
});

///////////////////
exports.checkEmail = (req, res) => {
  res.render("registeredSuccess", {
    redirectURL: process.env.FRONT_END_URL,
  });
};

///////////////
exports.reSendVerificationEmail = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("please Provide Email ", 400));
  }
  const user = await PersonSchema.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }

  const resetToken = personCreated.getResetPasswordToken();

  await personCreated.save({ validateBeforeSave: false });

  // Create reset password url
  const verifyURL = `${req.protocol}://${req.get(
    "host"
  )}/verifyUser/?token=${resetToken}&userName=${userName}`;

  // const message = `Hi ${userName}, \n\n Click on the Link to Verify Your Account :\n\n${verifyURL}\n\nIf you have not requested this email, then ignore it.`;

  try {
    console.log("In email ");

    await sendEmail({
      userName: user.userName,
      email: email,
      subject: "Account Verification Through Email",
      verifyURL,
    });

    res.status(200).json({
      success: true,
      message: `Verification Email has been sent to: ${email}, please Check your in inbox or spam `,
    });
  } catch (error) {
    personCreated.resetPasswordToken = undefined;
    personCreated.resetPasswordExpire = undefined;
    await personCreated.save({ validateBeforeSave: false });

    // console.log("In Error");

    return next(new ErrorHandler(error.message, 500));
  }
});

///////////////////////////
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorHandler("Please enter a valid email address and password", 400)
    );
  }
  const user = await PersonSchema.findOne({ email }).select("+password");
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
        "User account is not activated yet, Activate account to Use GameRee Platform",
        401
      )
    );
  }
});

/////////////////////
exports.googleLogin = catchAsyncErrors(async (req, res, next) => {
  const { idToken } = req.body;

  client
    .verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    .then((response) => {
      const { email_verified, name, email } = response.payload;

      console.log(email_verified);
      if (email_verified) {
        PersonSchema.findOne({ email }).exec(async (err, user) => {
          if (user) {
            sendToken(user, 200, res, "Login Successfully");
          } else {
            let userName = email.split("@")[0];
            let password = "CoolGuyP@ss123";

            const personCreated = await PersonSchema.create({
              userName,
              email,
              password,
            });

            personCreated.active = true;
            await personCreated.save({ validateBeforeSave: false });

            /**
             *
             * no need to send mail because already verified from google
             * */

            sendToken(personCreated, 200, res, "Login Successfully");
          }
        });
      } else {
        return res.status(402).json({
          error: "Google login failed. Try again",
        });
      }
    });
});

////////////////////////
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Log out",
  });
});

///////////////////////
exports.activateUser = catchAsyncErrors(async (req, res, next) => {
  const { token, email } = req.query;
  // res.send(token)

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  console.log(resetPasswordToken);

  const user = await PersonSchema.findOne({
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

////////////////
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await PersonSchema.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  // console.log('before save method',resetToken)

  await user.save({ validateBeforeSave: false });

  // Create reset password url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

  try {
    await forgotEmail({
      userName: user.userName,
      email: req.body.email,
      subject: "Account Verification Through Email",
      message,
      resetUrl,
    });

    res.status(200).json({
      success: true,
      message: `Passowrd reset email has been sent to: ${user.email}`,
    });
  } catch (error) {
    console.log("In Error");
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

////////////////
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const foundPerson = await PersonSchema.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!foundPerson) {
    res.render("tokenExpired", {
      redirectURL: process.env.FRONT_END_URL,
    });
    return;
  } else {
    res.render("ChangePassword", {
      id: foundPerson._id,
      api: process.env.API_LINK,
      redirectURL: process.env.FRONT_END_URL,
    });
  }
});

//////////////////
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.body;
  if (name == "HaseebU") {
    const allUsers = await PersonSchema.find();
    res.status(200).json({
      success: true,
      users: allUsers,
    });
  } else
    res.status(404).json({
      success: false,
      users: "oh",
    });
});

//////////////////////
exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const { id, password } = req.body;
  const foundPerson = await PersonSchema.findById(id);
  console.log(foundPerson);
  if (!foundPerson) {
    return next(new ErrorHandler("Password reset token Expired  ", 400));
  }

  console.log("before assign password");
  foundPerson.password = password;
  foundPerson.resetPasswordToken = undefined;
  foundPerson.resetPasswordExpire = undefined;

  try {
    await foundPerson.save();
    console.log("after assign password");
  } catch (e) {
    console.log(e);
  }
  res.status(200).json({
    success: true,
    message: "user password has been reset",
  });
});

exports.deleteMyAccount = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorHandler("Please Enter a valid email address and password", 400)
    );
  }
  const user = await PersonSchema.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const deleted = await PersonSchema.deleteOne({ email });

  res.status(200).json({
    success: true,
    message: `${email} account has been deleted `,
  });
});
