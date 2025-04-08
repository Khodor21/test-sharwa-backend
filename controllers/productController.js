import Product from "../models/Product.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

import { uploadImageToFirebase } from "../utils/firebaseUtils.js";
import { handleResponse, handleError } from "../utils/helpers.js";

// Create Product
const createProduct = async (req, res) => {
  const {
    title,
    description,
    category_id,
    pin,
    quantity,
    price,
    target_audience,
  } = req.body;
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  try {
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    if (!req.body || !req.files) {
      return res.status(400).json({
        success: false,
        message: "Missing form data or files",
      });
    }
    const mainImageFile = req.files[0];
    const mainImageUrl = await uploadImageToFirebase(
      mainImageFile.buffer,
      mainImageFile.originalname,
      mainImageFile.mimetype,
      "products"
    );

    // Upload additional images
    const additionalImages = [];
    for (let i = 1; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = await uploadImageToFirebase(
        file.buffer,
        file.originalname,
        file.mimetype,
        "products"
      );
      additionalImages.push(imageUrl);
    }

    // Create the new product
    const product = new Product({
      title,
      description,
      category_id,
      related_products: [],
      pin,
      main_image: mainImageUrl,
      images: additionalImages,
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

const getProductByCategoryId = async (req, res) => {
  const { category_id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(category_id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Category Id",
    });
  }

  try {
    const products = await Product.find({ category_id });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for this category",
      });
    }

    return handleResponse(res, products, 200, "Products found");
  } catch (error) {
    return handleError(res, error);
  }
};

export default getProductByCategoryId;

// Update Product
const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Product ID",
    });
  }

  const {
    title,
    description,
    category_id,
    // related_products,
    pin,
    quantity,
    price,
    target_audience,
  } = req.body;

  try {
    // Validate that the category_id (if provided) exists
    if (category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Fetch the existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Initialize updated product data
    const updatedData = {
      title: title || existingProduct.title,
      description: description || existingProduct.description,
      category_id: category_id || existingProduct.category_id,
      related_products: existingProduct.related_products,
      // related_products: related_products || existingProduct.related_products,
      pin: pin !== undefined ? pin : existingProduct.pin,
      quantity: quantity !== undefined ? quantity : existingProduct.quantity,
      price: price !== undefined ? price : existingProduct.price,
      target_audience: target_audience || existingProduct.target_audience,
    };

    // Handle uploaded images if provided
    if (req.files && req.files.length > 0) {
      // Upload new main image
      const mainImageFile = req.files[0];
      const mainImageUrl = await uploadImageToFirebase(
        mainImageFile.buffer,
        mainImageFile.originalname,
        mainImageFile.mimetype,
        "products"
      );

      updatedData.main_image = mainImageUrl;

      // Upload new additional images
      const additionalImages = [];
      for (let i = 1; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = await uploadImageToFirebase(
          file.buffer,
          file.originalname,
          file.mimetype,
          "products"
        );
        additionalImages.push(imageUrl);
      }

      updatedData.images = additionalImages;
    } else {
      // If no new images are provided, retain existing images
      updatedData.main_image = existingProduct.main_image;
      updatedData.images = existingProduct.images;
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    return handleResponse(
      res,
      updatedProduct,
      200,
      "Product updated successfully"
    );
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
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      title: { $regex: query, $options: "i" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductByCategoryId,
  upload,
};
