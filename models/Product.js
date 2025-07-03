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
    type: Number,
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
    default: "0",
  },
  discount_type: {
    type: String,
    enum: ["percentage", "value", "no-discount"],
    required: false,
    default: "value",
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
  variations: {
    type: [
      {
        name: { type: String },
        options: [
          {
            label: String,
            image: String,
          },
        ],
      },
    ],
    default: [],
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
