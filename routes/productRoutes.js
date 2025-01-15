const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.post(
  "/product",
  productController.upload.array("images", 10),
  productController.createProduct
);

router.get("/products", productController.getAllProducts);

router.get("/products/:id", productController.getProductById);

router.post(
  "/products/:id",
  productController.upload.array("images", 10),
  productController.updateProduct
);

router.delete("/products/:id", productController.deleteProduct);

module.exports = router;
