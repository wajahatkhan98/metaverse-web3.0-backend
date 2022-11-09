const express = require("express");
const {
  addPerson,
  login,
  googleLogin,
  activateUser,
  logout,
  reSendVerificationEmail,
  deleteAll,
  deleteMyAccount,
  resetPassword,
  testMail,
  forgotPassword,
  checkEmail,
  changePassword,
  getAllUsers,
} = require("../controllers/PersonController");
const router = express.Router();

// router.route("/check").get(checkEmail);

router.route("/register").post(addPerson);
router.route("/delete").post(deleteAll);

router.route("/getAllUsers").post(getAllUsers);
router.route("/deleteMyAccount").post(deleteMyAccount);
router.route("/login").post(login);
router.route("/googleLogin").post(googleLogin);

router.route("/verifyUser").get(activateUser);
router.route("/logout").post(logout);
router.route("/password/change").post(changePassword);
router.route("/password/reset/:token").get(resetPassword);
router.route("/api/forgotPassword").post(forgotPassword);
router.route("/resetVerification").post(reSendVerificationEmail);

router.route("/send").get(testMail);

router.route("/").post((req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend  Working !!!",
  });
});

router.route("/").get((req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Working !!!",
  });
});

module.exports = router;
