const jwt = require("jsonwebtoken");
const user = require("../models/Person");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Login First To Acess Page", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
