const Hero = require("../models/HeroSection");
const { handleResponse, handleError } = require("../utils/helpers");
const { uploadImageToFirebase } = require("../utils/firebaseUtils");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const createHero = async (req, res) => {
  try {
    const { title } = req.body;
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);
    if (!req.file) {
      return handleResponse(res, null, 400, "Image is required");
    }

    const { buffer, originalname, mimetype } = req.file;

    const imageUrl = await uploadImageToFirebase(
      buffer,
      originalname,
      mimetype,
      "heroes"
    );

    const hero = new Hero({ title, image: imageUrl });
    await hero.save();

    handleResponse(res, hero, 201, "Hero section created");
  } catch (error) {
    handleError(res, error);
  }
};

const getHero = async (req, res) => {
  try {
    const hero = await Hero.findOne();
    if (!hero) {
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
