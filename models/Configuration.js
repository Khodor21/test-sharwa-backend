const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ["navbar", "rules", "contact"] },
  navbarType: { type: String, enum: ["top-navbar", "bottom-navbar"] },
  titles: [{ type: String }],

  ruleType: {
    type: String,
    enum: ["about-us", "privacy-policy", "terms-of-services"],
  },
  paragraphs: { type: String },
  image: { type: String },
  contacts: [
    {
      title: { type: String },
      content: { type: String },
    },
  ],
});

module.exports = mongoose.model("Config", configSchema);
