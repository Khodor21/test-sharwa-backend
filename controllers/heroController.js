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

module.exports = {
  createHero,
  getHero,
  upload,
};
