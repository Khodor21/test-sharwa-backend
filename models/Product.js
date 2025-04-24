const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
    default: 0,
  },
  price: {
    type: String,
    required: true,
  },
  discount: {
    type: String,
    required: false,
  },
  target_audience: {
    type: String,
    required: true,
  },
  related_products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  pin: {
    type: Boolean,
    default: false,
  },
  main_image: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
