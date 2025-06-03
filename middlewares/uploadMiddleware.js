const multer = require("multer");

const storage = multer.memoryStorage(); // Store in memory before uploading to Firebase

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB per file
}).fields([
  { name: "banner_1", maxCount: 1 },
  { name: "banner_2", maxCount: 1 },
  { name: "banner_3", maxCount: 1 },
  { name: "banner_4r", maxCount: 1 },
]);
module.exports = upload;
