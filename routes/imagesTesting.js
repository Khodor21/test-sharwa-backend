const express = require("express");
const multer = require("multer");
const uploadImage = require("../config/firebase");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    await uploadImage(filePath);
    res.send("Image uploaded successfully!");
  } catch (error) {
    res.status(500).send("Failed to upload image.");
  }
});

module.exports = router;
