const mongoose = require("mongoose");

const mainSectionSchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  banners_type: {
    type: String,
    enum: ["mono", "duo", "trio", "quatro", "slim-mono"],
  },
  banner_1: {
    type: String,
  },
  banner_2: {
    type: String,
  },
  banner_3: {
    type: String,
  },
  banner_4: {
    type: String,
  },
});

mainSectionSchema.virtual("products", {
  ref: "Product",
  localField: "category_id",
  foreignField: "category_id",
  match: { pin: true },

  justOne: false,
});

// Ensure virtuals are included when the model is converted to JSON
mainSectionSchema.set("toJSON", { virtuals: true });
mainSectionSchema.set("toObject", { virtuals: true }); // Add this to ensure it works with both JSON and object outputs

const MainSection = mongoose.model("MainSection", mainSectionSchema);

module.exports = MainSection;
