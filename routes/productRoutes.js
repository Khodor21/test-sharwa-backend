const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Create a new product
router.post("/product", productController.createProduct);

// Get all products
router.get("/products", productController.getAllProducts);

// Get a product by ID
router.get("/products/:id", productController.getProductById);

// Update a product
router.post("/products/:id", productController.updateProduct);

// Delete a product
router.delete("/products/:id", productController.deleteProduct);

module.exports = router;
