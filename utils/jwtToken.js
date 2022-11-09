const sendToken = (user, statusCode, res, message) => {
  const token = user.getJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // sending user for testing purpose only

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    message,
    user,
  });
};
module.exports = sendToken;
