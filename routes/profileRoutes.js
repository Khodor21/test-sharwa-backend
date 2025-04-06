const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllCustomers,
  getProfile,
  updateProfile,
  deleteAccount,
} = require("../controllers/profileController");

router.get("/customers", getAllCustomers);
router.get("/profile", getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.delete("/profile", authMiddleware, deleteAccount);

module.exports = router;
