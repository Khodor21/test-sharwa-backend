const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema({
  ruleType: {
    type: String,
    enum: ["about-us", "privacy-policy", "terms-of-services"],
    required: true,
  },
  paragraphs: { type: String, required: true },
  image: { type: String },
});

const configSchema = new mongoose.Schema({
  type: { type: String, enum: ["navbar", "rules", "contact"] },
  navbarType: { type: String, enum: ["top-navbar", "bottom-navbar"] },
  titles: [{ type: String }],

  rules: [ruleSchema],

  contacts: [
    {
      title: { type: String },
      content: { type: String },
    },
  ],
});

module.exports = mongoose.model("Config", configSchema);
