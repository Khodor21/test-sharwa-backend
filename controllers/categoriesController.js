const Category = require("../models/Category");
const bucket = require("../config/firebase");
const multer = require("multer");
const path = require("path");

const upload = multer({ dest: "uploads/" });

const uploadImageToFirebase = async (filePath) => {
  const destination = `categories/${path.basename(filePath)}`;
  await bucket.upload(filePath, {
    destination,
    public: true,
  });
  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
};

//Khodor's function
// const createCategory = async (req, res) => {
//   try {
//     const { title, description } = req.body;
//     const filePath = req.file.path;
//     const imageUrl = await uploadImageToFirebase(filePath);

//     const category = new Category({
//       title,
//       description,
//       image: imageUrl,
//     });

//     await category.save();
//     res.status(201).json(category);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating category", error });
//   }
// };

//Oussama's function
const createCategory = async (req, res) => {
  try {
    const { title, description, image } = req.body;

    const category = new Category({
      title,
      description,
      image,
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
  // getCategoryById,
  updateCategory,
  deleteCategory,
  upload,
};
