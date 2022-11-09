const express = require("express");
const {
  loginAdmin,
  addAdmin,
  activateAdmin,
  deleteAll,
  getAllUsers,
  deleteUserByEmail,
  // mailAllUsers,
} = require("../controllers/AdminController");
const { isAuthenticatedAdmin } = require("../middlewares/AdminAuth");
const router = express.Router();
router.route("/loginAdmin").post(loginAdmin);
// will be commented
router.route("/delete").post(deleteAll);
router.route("/deleteByEmail").post(deleteUserByEmail);

router.route("/getAllUsers").all(isAuthenticatedAdmin, getAllUsers);
// router.route("/mailUsers").post(mailAllUsers);
router.route("/registerAdmin").post(addAdmin);
router.route("/verifyAdmin").get(activateAdmin);

module.exports = router;
