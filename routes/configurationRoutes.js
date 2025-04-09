const express = require("express");
const router = express.Router();
const {
  saveConfig,
  getConfig,
  updateConfig,
  deleteConfig,
  upload,
} = require("../controllers/configurationController");

router.post("/config", upload.single("file"), saveConfig);
router.get("/config/:type", getConfig);
router.put("/config/:id", updateConfig);
router.delete("/config/:id", deleteConfig);

module.exports = router;
