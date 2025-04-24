const Product = require("../models/Product.js");
const Category = require("../models/Category.js");
const mongoose = require("mongoose");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const { uploadImageToFirebase } = require("../utils/firebaseUtils.js");
const { handleResponse, handleError } = require("../utils/helpers.js");

// Create Product
const createProduct = async (req, res) => {
  const {
    title,
    description,
    category_id,
    pin,
    quantity,
    price,
    discount, // ✅ added
    target_audience,
    related_products,
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

    // Expecting files in form-data with keys: main_image and images[]
    const mainImageFile = req.files?.main_image?.[0];
    const additionalImageFiles = req.files?.images || [];

    if (!mainImageFile) {
      return res.status(400).json({
        success: false,
        message: "Main image is required",
      });
    }

    // Upload main image
    const mainImageUrl = await uploadImageToFirebase(
      mainImageFile.buffer,
      mainImageFile.originalname,
      mainImageFile.mimetype,
      "products"
    );

    // Upload additional images
    const additionalImages = [];
    for (const file of additionalImageFiles) {
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
      related_products,
      pin,
      main_image: mainImageUrl,
      images: additionalImages,
      quantity,
      price,
      discount, // ✅ added here
      target_audience,
    });

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

const getProductsByCategoryTitle = async (req, res) => {
  const { title } = req.query;

  try {
    const category = await Category.findOne({
      title: new RegExp(`^${title}$`, "i"),
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const products = await Product.find({ category_id: category._id });

    return res.status(200).json({
      success: true,
      message: "Products found",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    category_id,
    pin,
    quantity,
    price,
    discount,
    target_audience,
    related_products,
  } = req.body;

  console.log("BODY:", req.body);
  console.log("FILES:", req.files);

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update basic fields if present
    if (title) product.title = title;
    if (description) product.description = description;
    if (category_id) product.category_id = category_id;
    if (typeof pin !== "undefined") product.pin = pin;
    if (quantity) product.quantity = quantity;
    if (price) product.price = price;
    if (discount) product.discount = discount;
    if (target_audience) product.target_audience = target_audience;

    // Handle related_products (optional)
    if (related_products) {
      try {
        product.related_products = JSON.parse(related_products);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid format for related_products",
        });
      }
    }

    // Handle main_image update (if provided)
    const mainImageFile = req.files?.main_image?.[0];
    if (mainImageFile) {
      const mainImageUrl = await uploadImageToFirebase(
        mainImageFile.buffer,
        mainImageFile.originalname,
        mainImageFile.mimetype,
        "products"
      );
      product.main_image = mainImageUrl;
    }

    // Handle additional images update (if provided)
    const additionalImageFiles = req.files?.images || [];
    if (additionalImageFiles.length > 0) {
      const newImages = [];
      for (const file of additionalImageFiles) {
        const imageUrl = await uploadImageToFirebase(
          file.buffer,
          file.originalname,
          file.mimetype,
          "products"
        );
        newImages.push(imageUrl);
      }
      product.images = newImages;
    }

    await product.save();
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

// Search Product
const searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.query;

    if (typeof searchTerm !== "string" || !searchTerm.trim()) {
      return res.status(400).json({ message: "Invalid query parameter" });
    }

    const products = await Product.find({
      title: { $regex: searchTerm, $options: "i" },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategoryTitle,
  upload,
};
