const express = require("express");
const router = express.Router();
const {
  productController,
  upload,
  createProduct,
  getAllProducts,
  getProductById,
  getProductByCategoryId,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require("../controllers/productController");

router.post("/product", upload.array("images", 10), createProduct);

router.get("/products", getAllProducts);

router.get("/search", searchProducts);

router.get("/products/:id", getProductById);

router.post("/products/:id", upload.array("images", 10), updateProduct);

router.get("/productsByCategory", getProductByCategoryId);

router.delete("/products/:id", deleteProduct);

module.exports = router;
