const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  upload,
} = require("../controllers/categoriesController");

router.post("/category", upload.single("image"), createCategory);

router.get("/categories", getAllCategories);

router.put("/category/:id", updateCategory);

router.delete("/category/:id", deleteCategory);

module.exports = router;
