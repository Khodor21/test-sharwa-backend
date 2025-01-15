const MainSection = require("../models/MainSection");
const { handleResponse, handleError } = require("../utils/helpers");
const Category = require("../models/Category");
const Product = require("../models/Product");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const { uploadImageToFirebase } = require("../utils/firebaseUtils");

// Create a new MainSection
const createMainSection = async (req, res) => {
  try {
    const { category_id, title, banners_type } = req.body;

    // Validate that category_id exists
    const category = await Category.findById(category_id);
    if (!category) {
      return handleResponse(res, null, 400, "Category not found");
    }

    // Process uploaded images
    if (!req.files || req.files.length === 0) {
      return handleResponse(res, null, 400, "No images uploaded");
    }

    // Determine number of images based on banners_type using switch statement
    let numberOfImages;

    switch (banners_type) {
      case "Mono":
      case "SlimMono":
        numberOfImages = 1; // Mono/SlimMono - First image only
        break;
      case "Duo":
        numberOfImages = 2; // Duo - First 2 images
        break;
      case "Trio":
        numberOfImages = 3; // Trio - First 3 images
        break;
      case "Quatro":
        numberOfImages = 4; // Quatro - First 4 images
        break;
      default:
        return handleResponse(res, null, 400, "Invalid banners_type");
    }

    // Ensure there are enough images uploaded
    if (req.files.length < numberOfImages) {
      return handleResponse(
        res,
        null,
        400,
        `You need to upload at least ${numberOfImages} images for the selected banners_type.`
      );
    }

    // Upload the images to Firebase
    const uploadedImages = [];
    for (let i = 0; i < numberOfImages; i++) {
      const file = req.files[i];
      const imageUrl = await uploadImageToFirebase(
        file.buffer,
        file.originalname,
        file.mimetype,
        "main-sections"
      );
      uploadedImages.push(imageUrl);
    }

    // Create the MainSection object
    const newMainSection = new MainSection({
      category_id,
      title,
      banners_type,
      images: uploadedImages,
    });

    // Save the MainSection to the database
    await newMainSection.save();
    handleResponse(
      res,
      newMainSection,
      201,
      "MainSection created successfully"
    );
  } catch (error) {
    handleError(res, error);
  }
};

// Retrieve all MainSections
const getAllMainSections = async (req, res) => {
  try {
    // Find all main sections and populate the 'products' field via the virtual
    const mainSections = await MainSection.find().populate("category_id");

    // Send the response with the mainSections and their respective products
    handleResponse(res, mainSections);
  } catch (error) {
    handleError(res, error);
  }
};

// Retrieve a specific MainSection by ID
const getMainSectionById = async (req, res) => {
  try {
    const { id } = req.params; // Get section ID from the request parameters

    // Find the MainSection by ID and populate the 'category_id' and 'products' virtual field
    const mainSection = await MainSection.findById(id)
      .populate("category_id")
      .populate("products");

    // If no MainSection found, return an error
    if (!mainSection) {
      return handleResponse(res, null, 404, "MainSection not found");
    }

    // Send the response with the MainSection and its associated products
    handleResponse(res, mainSection);
  } catch (error) {
    handleError(res, error);
  }
};

// Update a MainSection by ID
const updateMainSection = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from request params
    const { category_id, title, banners_type } = req.body; // Extract other fields from request body

    // Find the existing MainSection by ID
    const mainSection = await MainSection.findById(id);
    if (!mainSection) {
      return handleResponse(res, null, 404, "MainSection not found");
    }

    // Validate that category_id exists (and ensure it's the same as before or changed)
    if (category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return handleResponse(res, null, 400, "Category not found");
      }
    }

    // Process uploaded images, if any
    let uploadedImages = mainSection.images; // Keep the current images in case no new images are uploaded

    if (req.files && req.files.length > 0) {
      // Determine number of images based on banners_type using switch statement
      let numberOfImages;

      switch (
        banners_type ||
        mainSection.banners_type // Use the existing banners_type if not provided
      ) {
        case "Mono":
        case "SlimMono":
          numberOfImages = 1; // Mono/SlimMono - First image only
          break;
        case "Duo":
          numberOfImages = 2; // Duo - First 2 images
          break;
        case "Trio":
          numberOfImages = 3; // Trio - First 3 images
          break;
        case "Quatro":
          numberOfImages = 4; // Quatro - First 4 images
          break;
        default:
          return handleResponse(res, null, 400, "Invalid banners_type");
      }

      // Ensure there are enough images uploaded
      if (req.files.length < numberOfImages) {
        return handleResponse(
          res,
          null,
          400,
          `You need to upload at least ${numberOfImages} images for the selected banners_type.`
        );
      }

      // Upload the images to Firebase (if uploading new images)
      uploadedImages = [];
      for (let i = 0; i < numberOfImages; i++) {
        const file = req.files[i];
        const imageUrl = await uploadImageToFirebase(
          file.buffer,
          file.originalname,
          file.mimetype,
          "main-sections"
        );
        uploadedImages.push(imageUrl);
      }
    }

    // Update the MainSection object with provided or existing values
    mainSection.category_id = category_id || mainSection.category_id;
    mainSection.title = title || mainSection.title;
    mainSection.banners_type = banners_type || mainSection.banners_type;
    mainSection.images = uploadedImages; // Update images with the new ones or keep old ones

    // Save the updated MainSection to the database
    await mainSection.save();
    handleResponse(res, mainSection, 200, "MainSection updated successfully");
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a MainSection by ID
const deleteMainSection = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMainSection = await MainSection.findByIdAndDelete(id);

    if (!deletedMainSection) {
      return handleResponse(res, null, 404, "MainSection not found");
    }

    handleResponse(res, null, 200, "MainSection deleted successfully");
  } catch (error) {
    handleError(res, error);
  }
};
module.exports = {
  createMainSection,
  getAllMainSections,
  getMainSectionById,
  updateMainSection,
  deleteMainSection,
  upload,
};
