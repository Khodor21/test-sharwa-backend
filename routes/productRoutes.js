const express = require("express");
const router = express.Router();
const {
  productController,
  upload,
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByCategoryTitle,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require("../controllers/productController");
router.post(
  "/product",
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  createProduct
);

router.post("/product", upload.array("images", 10), createProduct);

router.get("/products", getAllProducts);

router.get("/search", searchProducts);

router.get("/products/:id", getProductById);

router.post(
  "/product/:id",
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateProduct
);

router.get("/productsByCategory", getProductsByCategoryTitle);

router.delete("/products/:id", deleteProduct);

module.exports = router;
