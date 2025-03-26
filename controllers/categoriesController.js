const Category = require("../models/Category");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { uploadImageToFirebase } = require("../utils/firebaseUtils");

const createCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { buffer, originalname, mimetype } = req.file;
    const fileName = originalname;
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = await uploadImageToFirebase(
      buffer,
      fileName,
      mimetype,
      "categories"
    );

    const category = new Category({
      title,
      description,
      image: imageUrl,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  upload,
};
