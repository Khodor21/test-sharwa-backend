const Category = require("../models/Category");
const Product = require("../models/Product");
const MainSection = require("../models/MainSection");

const { handleResponse, handleError } = require("../utils/helpers");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { uploadImageToFirebase } = require("../utils/firebaseUtils");
const { default: mongoose } = require("mongoose");

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return handleResponse(res, null, 400, "Image is required");
    }

    const { buffer, originalname, mimetype } = req.file;
    const imageUrl = await uploadImageToFirebase(
      buffer,
      originalname,
      mimetype,
      "categories"
    );

    const category = new Category({
      title,
      description,
      image: imageUrl,
    });

    await category.save();
    handleResponse(res, category, 201, "Category created successfully");
  } catch (error) {
    handleError(res, error);
  }
};

// Retrieve all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    handleResponse(res, categories);
  } catch (error) {
    handleError(res, error);
  }
};

// Update a category by ID
const updateCategory = async (req, res) => {
  try {
    const { type: id } = req.params;
    const { title, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleResponse(res, null, 400, "Invalid category ID");
    }

    const category = await Category.findById(id);
    if (!category) {
      return handleResponse(res, null, 404, "Category not found");
    }

    category.title = title || category.title;
    category.description = description || category.description;

    await category.save();
    handleResponse(res, category, 200, "Category updated successfully");
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a category by ID

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleResponse(res, null, 400, "Invalid category ID");
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return handleResponse(res, null, 404, "Category not found");
    }

    // 🔥 Delete related products
    await Product.deleteMany({ category_id: id });

    // 🔥 Delete related main sections
    await MainSection.deleteMany({ category_id: id });

    return handleResponse(
      res,
      null,
      200,
      "Category, related products, and related main sections deleted"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  upload,
};
