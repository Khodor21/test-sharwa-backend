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
  banner_one: {
    type: String,
  },
  banner_two: {
    type: String,
  },
  banner_three: {
    type: String,
  },
  banner_four: {
    type: String,
  },
});

// Add virtual field for products, not stored in the database
mainSectionSchema.virtual("products", {
  ref: "Product", // Reference the Product model
  localField: "category_id", // The field in this schema to match the Product model
  foreignField: "category_id", // The field in the Product model to match
  match: { pin: true }, // Only products where pin is true
  justOne: false, // False because we want an array of products
});

// Ensure virtuals are included when the model is converted to JSON
mainSectionSchema.set("toJSON", { virtuals: true });
mainSectionSchema.set("toObject", { virtuals: true }); // Add this to ensure it works with both JSON and object outputs

const MainSection = mongoose.model("MainSection", mainSectionSchema);

module.exports = MainSection;
