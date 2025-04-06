const express = require("express");
const router = express.Router();
const {
  saveConfig,
  getConfig,
} = require("../controllers/configurationController");

router.post("/config", saveConfig);
router.get("/config/:type", getConfig);

module.exports = router;
