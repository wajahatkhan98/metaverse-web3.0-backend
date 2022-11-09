const jwt = require("jsonwebtoken");
const user = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  // console.log( typeof (token));
  // console.log( typeof (process.env.JWT_SECRET) );
  if (!token) {
    return next(new ErrorHandler("Login First To Acess Page", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(decoded);

  req.user = await user.findById(decoded.id);
  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      new ErrorHandler(
        `Role ${req.user.role} is not allowed  to access this resource `,
        403
      );
    }
    next();
  };
};
