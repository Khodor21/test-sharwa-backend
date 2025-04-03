const express = require("express");
const router = express.Router();
const {
  upload,
  createMainSection,
  getAllMainSections,
  getMainSectionById,
  updateMainSection,
  deleteMainSection,
} = require("../controllers/mainSectionController");

router.post("/main-section", upload.array("images", 10), createMainSection);

router.get("/main-section", getAllMainSections);

router.get("/main-section/:id", getMainSectionById);

router.post("/main-section/:id", upload.array("images", 10), updateMainSection);

router.delete("/main-section/:id", deleteMainSection);

module.exports = router;
