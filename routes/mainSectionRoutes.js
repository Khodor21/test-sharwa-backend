const express = require("express");
const router = express.Router();
const mainSectionController = require("../controllers/mainSectionController");

router.post(
  "/main-sections",
  mainSectionController.upload.array("images", 10),
  mainSectionController.createMainSection
);

router.get("/main-sections", mainSectionController.getAllMainSections);

router.get("/main-sections/:id", mainSectionController.getMainSectionById);

router.post(
  "/main-sections/:id",
  mainSectionController.upload.array("images", 10),
  mainSectionController.updateMainSection
);

router.delete("/main-sections/:id", mainSectionController.deleteMainSection);

module.exports = router;
