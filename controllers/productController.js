const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");

const handleResponse = (res, data, statusCode = 200, message = null) => {
  return res.status(statusCode).json({
    success: true,
    message: message || "Operation successful",
    data: data,
  });
};

const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  return res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
  });
};

// Create Product
const createProduct = async (req, res) => {
  const {
    title,
    description,
    category_id,
    related_products,
    pin,
    main_image,
    images,
    quantity,
    price,
    target_audience,
  } = req.body;

  try {
    // Validate that category_id exists
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    // Create a new product
    const product = new Product({
      title,
      description,
      category_id,
      related_products,
      pin,
      main_image,
      images,
      quantity,
      price,
      target_audience,
    });

    // Save the product to the database
    await product.save();
    return handleResponse(res, product, 201, "Product created successfully");
  } catch (error) {
    return handleError(res, error);
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category_id")
      .populate("related_products");
    return handleResponse(res, products, 200, "Products found");
  } catch (error) {
    return handleError(res, error);
  }
};

// Get Single Product
const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Product ID",
    });
  }

  try {
    const product = await Product.findById(id)
      .populate("category_id")
      .populate("related_products");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return handleResponse(res, product, 200, "Product found");
  } catch (error) {
    return handleError(res, error);
  }
};

// Update Product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Product ID",
    });
  }

  try {
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return handleResponse(res, product, 200, "Product updated successfully");
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Product ID",
    });
  }

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return handleResponse(res, null, 200, "Product deleted successfully");
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
