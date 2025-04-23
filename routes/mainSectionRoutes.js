const express = require("express");
const router = express.Router();
const mainSectionController = require("../controllers/mainSectionController");
const upload = require("../middlewares/uploadMiddleware.js");

router.post("/main-sections", upload, mainSectionController.createMainSection);

router.get("/main-sections", mainSectionController.getAllMainSections);

router.get(
  "/main-sections/:section_id",
  mainSectionController.getMainSectionById
);

router.post(
  "/main-sections/:section_id",
  upload,
  mainSectionController.updateMainSection
);

router.delete("/main-sections/:id", mainSectionController.deleteMainSection);

module.exports = router;
