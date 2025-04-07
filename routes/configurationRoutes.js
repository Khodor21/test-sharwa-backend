const express = require("express");
const router = express.Router();
const {
  saveConfig,
  getConfig,
  updateConfig,
} = require("../controllers/configurationController");

router.post("/config", saveConfig);
router.get("/config/:type", getConfig);
router.put("/config/:id", updateConfig);

module.exports = router;
