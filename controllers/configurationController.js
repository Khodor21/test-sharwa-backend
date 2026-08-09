const Config = require("../models/Configuration");
const { uploadImageToFirebase } = require("../utils/firebaseUtils");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// const saveConfig = async (req, res) => {
//   try {
//     const { type, navbarType, titles, contacts } = req.body;

//     if (!type) {
//       return res.status(400).json({ message: "Missing configuration type" });
//     }

//     if (type === "rules") {
//       if (!req.body.rules) {
//         return res.status(400).json({ message: "Rules data is required" });
//       }

//       let rules;
//       try {
//         rules = JSON.parse(req.body.rules);
//       } catch (err) {
//         return res.status(400).json({ message: "Invalid rules format" });
//       }

//       const processedRules = [];

//       for (let i = 0; i < rules.length; i++) {
//         const rule = rules[i];
//         let imageUrl = null;

//         if (i === 0 && req.file) {
//           const { buffer, originalname, mimetype } = req.file;
//           imageUrl = await uploadImageToFirebase(
//             buffer,
//             originalname,
//             mimetype,
//             "rules"
//           );
//         }

//         processedRules.push({
//           ruleType: rule.ruleType,
//           paragraphs: rule.paragraphs,
//           image: imageUrl,
//         });
//       }

//       const newConfig = new Config({
//         type,
//         rules: processedRules,
//         titles: [],
//         contacts: [],
//       });

//       await newConfig.save();

//       return res.status(201).json({
//         message: "Rules saved successfully",
//         data: newConfig,
//       });
//     }

//     let newConfig;

//     switch (type) {
//       case "navbar":
//         newConfig = new Config({
//           type,
//           navbarType,
//           titles: titles || [],
//           contacts: [],
//         });
//         break;

//       case "contact":
//         newConfig = new Config({
//           type,
//           contacts: contacts || [],
//           titles: [],
//         });
//         break;

//       default:
//         return res.status(400).json({ message: "Invalid configuration type" });
//     }

//     await newConfig.save();

//     return res.status(201).json({
//       message: "Configuration saved successfully",
//       data: newConfig,
//     });
//   } catch (error) {
//     console.error("Error in saveConfig:", error.message);
//     return res.status(500).json({
//       message: "Error saving configuration",
//       error: error.message,
//     });
//   }
// };
const saveConfig = async (req, res) => {
  try {
    const { type, navbarType, titles, contacts, heroImages } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Missing configuration type" });
    }

    if (type === "rules") {
      if (!req.body.rules) {
        return res.status(400).json({ message: "Rules data is required" });
      }

      let rules;
      try {
        rules = JSON.parse(req.body.rules);
      } catch (err) {
        return res.status(400).json({ message: "Invalid rules format" });
      }

      const processedRules = [];

      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        let imageUrl = null;

        if (i === 0 && req.file) {
          const { buffer, originalname, mimetype } = req.file;
          imageUrl = await uploadImageToFirebase(
            buffer,
            originalname,
            mimetype,
            "rules",
          );
        }

        processedRules.push({
          ruleType: rule.ruleType,
          paragraphs: rule.paragraphs,
          image: imageUrl,
        });
      }

      const newConfig = new Config({
        type,
        rules: processedRules,
        titles: [],
        contacts: [],
      });

      await newConfig.save();

      return res.status(201).json({
        message: "Rules saved successfully",
        data: newConfig,
      });
    }

    if (type === "hero") {
      if (!heroImages || !heroImages.length) {
        return res.status(400).json({ message: "Hero images are required" });
      }

      const newConfig = new Config({
        type,
        heroImages,
        titles: [],
        contacts: [],
      });

      await newConfig.save();

      return res.status(201).json({
        message: "Hero configuration saved successfully",
        data: newConfig,
      });
    }

    let newConfig;

    switch (type) {
      case "navbar":
        newConfig = new Config({
          type,
          navbarType,
          titles: titles || [],
          contacts: [],
        });
        break;

      case "contact":
        newConfig = new Config({
          type,
          contacts: contacts || [],
          titles: [],
        });
        break;

      default:
        return res.status(400).json({ message: "Invalid configuration type" });
    }

    await newConfig.save();

    return res.status(201).json({
      message: "Configuration saved successfully",
      data: newConfig,
    });
  } catch (error) {
    console.error("Error in saveConfig:", error.message);
    return res.status(500).json({
      message: "Error saving configuration",
      error: error.message,
    });
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
const updateConfig = async (req, res) => {
  try {
    const { type } = req.params;
    const updatedConfig = await Config.findOneAndUpdate({ type }, req.body, {
      new: true,
    });

    if (!updatedConfig) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    res.status(200).json({
      message: "Configuration updated successfully",
      data: updatedConfig,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating configuration", error: error.message });
  }
};

const deleteConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedConfig = await Config.findByIdAndDelete(id);

    if (!deletedConfig) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    res.status(200).json({ message: "Configuration deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting configuration", error: error.message });
  }
};

module.exports = { saveConfig, getConfig, updateConfig, deleteConfig, upload };
