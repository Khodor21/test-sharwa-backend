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

    // Initialize banners object
    const banners = {};

    // Process uploaded banner images if provided
    if (req.files) {
      if (req.files.banner_1) {
        banners.banner_1 = await uploadImageToFirebase(
          req.files.banner_1[0].buffer,
          req.files.banner_1[0].originalname,
          req.files.banner_1[0].mimetype,
          "main-sections"
        );
      }
      if (req.files.banner_2) {
        banners.banner_2 = await uploadImageToFirebase(
          req.files.banner_2[0].buffer,
          req.files.banner_2[0].originalname,
          req.files.banner_2[0].mimetype,
          "main-sections"
        );
      }
      if (req.files.banner_3) {
        banners.banner_3 = await uploadImageToFirebase(
          req.files.banner_3[0].buffer,
          req.files.banner_3[0].originalname,
          req.files.banner_3[0].mimetype,
          "main-sections"
        );
      }
      if (req.files.banner_4) {
        banners.banner_4 = await uploadImageToFirebase(
          req.files.banner_4[0].buffer,
          req.files.banner_4[0].originalname,
          req.files.banner_4[0].mimetype,
          "main-sections"
        );
      }
    }

    // Create the MainSection object
    const newMainSection = new MainSection({
      category_id,
      title,
      banners_type,
      ...banners, // Spread banner fields into the object
    });

    // Save to the database
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
    // Fetch all main sections and populate the 'category_id'
    const mainSections = await MainSection.find().populate("category_id");

    // Fetch all pinned products at once (to optimize queries)
    const pinnedProducts = await Product.find({ pin: true });

    // Format the response structure
    const formattedSections = mainSections.map((section) => {
      // Filter products that match the category_id of the section
      const filteredProducts = pinnedProducts.filter(
        (product) =>
          product.category_id.toString() === section.category_id?._id.toString()
      );

      return {
        category: section.category_id, // Already populated
        title: section.title,
        banners_type: section.banners_type,
        banners: {
          banner_1: section.banner_1 || "",
          banner_2: section.banner_2 || "",
          banner_3: section.banner_3 || "",
          banner_4: section.banner_4 || "",
        },
        products: filteredProducts, // Include filtered products
      };
    });

    // Send the formatted response
    handleResponse(res, formattedSections);
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
