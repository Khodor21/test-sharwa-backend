const express = require("express");
const router = express.Router();
const mainSectionController = require("../controllers/mainSectionController");

router.post(
  "/main-section",
  mainSectionController.upload.array("images", 10),
  mainSectionController.createMainSection
);

router.get("/main-section", mainSectionController.getAllMainSections);

router.get("/main-section/:id", mainSectionController.getMainSectionById);

router.post(
  "/main-section/:id",
  mainSectionController.upload.array("images", 10),
  mainSectionController.updateMainSection
);

router.delete("/main-section/:id", mainSectionController.deleteMainSection);

module.exports = router;
