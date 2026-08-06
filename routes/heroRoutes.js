const express = require("express");
const router = express.Router();
const {
  createHero,
  getHero,
  editHero,
  deleteHero,
  deleteAllHeroes,
  upload,
} = require("../controllers/heroController");

router.post("/hero", upload.array("images", 10), createHero);
router.get("/hero", getHero);

router.put("/hero/:id", editHero);

router.delete("/hero/:id", deleteHero);

router.delete("/heroes", deleteAllHeroes);

module.exports = router;
