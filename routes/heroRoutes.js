const express = require("express");
const router = express.Router();
const {
  createHero,
  getHero,
  upload,
} = require("../controllers/heroController");

router.post("/hero", upload.array("images", 10), createHero);
router.get("/hero", getHero);

module.exports = router;
