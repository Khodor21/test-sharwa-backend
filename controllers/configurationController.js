const Config = require("../models/Configuration");

const saveConfig = async (req, res) => {
  try {
    const { type, navbarType, titles, ruleType, paragraphs, contacts } =
      req.body;

    let newConfig;
    switch (type) {
      case "navbar":
        newConfig = new Config({ type, navbarType, titles });
        break;
      case "rules":
        newConfig = new Config({ type, ruleType, paragraphs });
        break;
      case "contact":
        newConfig = new Config({ type, contacts });
        break;
      default:
        return res.status(400).json({ message: "Invalid configuration type" });
    }

    await newConfig.save();
    res
      .status(201)
      .json({ message: "Configuration saved successfully", data: newConfig });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving configuration", error: error.message });
  }
};

const getConfig = async (req, res) => {
  try {
    const { type } = req.params;
    const config = await Config.find({ type });
    res.status(200).json({ data: config });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching configuration", error: error.message });
  }
};
module.exports = { saveConfig, getConfig };
