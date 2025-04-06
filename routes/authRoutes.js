const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getAuthToken,
  deleteAccount,
  updateProfile,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/token", getAuthToken);
router.delete("/user/:userId", deleteAccount);
router.put("/user/:userId", updateProfile);

module.exports = router;
