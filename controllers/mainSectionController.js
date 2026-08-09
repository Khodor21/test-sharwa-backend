const MainSection = require("../models/MainSection");
const {
  handleResponse,
  handleError,
  calculateFinalPrice,
} = require("../utils/helpers");
const Category = require("../models/Category");
const Product = require("../models/Product");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const { uploadImageToFirebase } = require("../utils/firebaseUtils");

// Create a new MainSection
const createMainSection = async (req, res) => {
  try {
    const { category_id, title, banners_type, order } = req.body;

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
          "main-sections",
        );
      }
      if (req.files.banner_2) {
        banners.banner_2 = await uploadImageToFirebase(
          req.files.banner_2[0].buffer,
          req.files.banner_2[0].originalname,
          req.files.banner_2[0].mimetype,
          "main-sections",
        );
      }
      if (req.files.banner_3) {
        banners.banner_3 = await uploadImageToFirebase(
          req.files.banner_3[0].buffer,
          req.files.banner_3[0].originalname,
          req.files.banner_3[0].mimetype,
          "main-sections",
        );
      }
      if (req.files.banner_4) {
        banners.banner_4 = await uploadImageToFirebase(
          req.files.banner_4[0].buffer,
          req.files.banner_4[0].originalname,
          req.files.banner_4[0].mimetype,
          "main-sections",
        );
      }
    }

    // Create the MainSection object
    const newMainSection = new MainSection({
      category_id,
      title,
      banners_type,
      order: order || 0, // Added order with default value 0
      ...banners,
    });

    // Save to the database
    await newMainSection.save();

    handleResponse(
      res,
      newMainSection,
      201,
      "MainSection created successfully",
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
    const formattedSections = mainSections
      .sort((a, b) => a.order - b.order) // Sort by order ascending
      .map((section) => {
        const filteredProducts = pinnedProducts.filter(
          (product) =>
            product.category_id.toString() ===
            section.category_id?._id.toString(),
        );

        return {
          category: section.category_id,
          title: section.title,
          banners_type: section.banners_type,
          order: section.order,
          banners: {
            banner_1: section.banner_1 || "",
            banner_2: section.banner_2 || "",
            banner_3: section.banner_3 || "",
            banner_4: section.banner_4 || "",
          },
          products: filteredProducts,
        };
      });

    handleResponse(res, formattedSections);
  } catch (error) {
    handleError(res, error);
  }
};

// Retrieve a specific MainSection by ID
const getMainSectionById = async (req, res) => {
  try {
    const { section_id } = req.params;

    const section =
      await MainSection.findById(section_id).populate("category_id");
    if (!section) {
      return handleResponse(res, null, 404, "MainSection not found");
    }

    const pinnedProducts = await Product.find({ pin: true });

    const filteredProducts = pinnedProducts.filter(
      (product) =>
        product.category_id.toString() === section.category_id?._id.toString(),
    );

    const formattedSection = {
      category: section.category_id,
      title: section.title,
      banners_type: section.banners_type,
      order: section.order,
      banners: {
        banner_1: section.banner_1 || "",
        banner_2: section.banner_2 || "",
        banner_3: section.banner_3 || "",
        banner_4: section.banner_4 || "",
      },
      products: filteredProducts,
    };

    handleResponse(res, formattedSection);
  } catch (error) {
    handleError(res, error);
  }
};

// Update a MainSection by ID
const updateMainSection = async (req, res) => {
  try {
    const { section_id } = req.params;
    const { category_id, title, banners_type, order } = req.body;

    const mainSection = await MainSection.findById(section_id);
    if (!mainSection) {
      return handleResponse(res, null, 404, "MainSection not found");
    }

    if (category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return handleResponse(res, null, 400, "Category not found");
      }
      mainSection.category_id = category_id;
    }

    if (title) mainSection.title = title;
    if (banners_type) mainSection.banners_type = banners_type;
    if (order !== undefined) mainSection.order = Number(order);

    if (req.files) {
      if (req.files.banner_1) {
        mainSection.banner_1 = await uploadImageToFirebase(
          req.files.banner_1[0].buffer,
          req.files.banner_1[0].originalname,
          req.files.banner_1[0].mimetype,
          "main-sections",
        );
      }
      if (req.files.banner_2) {
        mainSection.banner_2 = await uploadImageToFirebase(
          req.files.banner_2[0].buffer,
          req.files.banner_2[0].originalname,
          req.files.banner_2[0].mimetype,
          "main-sections",
        );
      }
      if (req.files.banner_3) {
        mainSection.banner_3 = await uploadImageToFirebase(
          req.files.banner_3[0].buffer,
          req.files.banner_3[0].originalname,
          req.files.banner_3[0].mimetype,
          "main-sections",
        );
      }
      if (req.files.banner_4) {
        mainSection.banner_4 = await uploadImageToFirebase(
          req.files.banner_4[0].buffer,
          req.files.banner_4[0].originalname,
          req.files.banner_4[0].mimetype,
          "main-sections",
        );
      }
    }

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
