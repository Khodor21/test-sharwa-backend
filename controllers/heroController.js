const Hero = require("../models/HeroSection");
const { handleResponse, handleError } = require("../utils/helpers");
const { uploadImageToFirebase } = require("../utils/firebaseUtils");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const createHero = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return handleResponse(res, null, 400, "At least one image is required");
    }

    const imageUrls = [];

    for (const file of req.files) {
      const url = await uploadImageToFirebase(
        file.buffer,
        file.originalname,
        file.mimetype,
        "heroes"
      );
      imageUrls.push(url);
    }

    const hero = new Hero({ images: imageUrls });
    await hero.save();

    handleResponse(res, hero, 201, "Hero section created");
  } catch (error) {
    handleError(res, error);
  }
};

const getHero = async (req, res) => {
  try {
    const hero = await Hero.find();
    if (!hero || hero.length === 0) {
      return handleResponse(res, null, 404, "Hero not found");
    }
    handleResponse(res, hero, 200, "Hero section fetched");
  } catch (error) {
    handleError(res, error);
  }
};

const editHero = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const hero = await Hero.findByIdAndUpdate(id, updates, { new: true });
    if (!hero) {
      return handleResponse(res, null, 404, "Hero not found");
    }
    handleResponse(res, hero, 200, "Hero section updated");
  } catch (error) {
    handleError(res, error);
  }
};

const deleteHero = async (req, res) => {
  try {
    const { id } = req.params;
    const hero = await Hero.findByIdAndDelete(id);
    if (!hero) {
      return handleResponse(res, null, 404, "Hero not found");
    }
    handleResponse(res, hero, 200, "Hero section deleted");
  } catch (error) {
    handleError(res, error);
  }
};

const deleteAllHeroes = async (req, res) => {
  try {
    const result = await Hero.deleteMany({});
    handleResponse(res, result, 200, "All hero sections deleted");
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createHero,
  getHero,
  editHero,
  deleteHero,
  deleteAllHeroes,
  upload,
};
// ...existing code...
module.exports = {
  createHero,
  getHero,
  upload,
};
