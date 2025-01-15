const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  items_count: {
    type: Number,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  customer_name: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  district: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  products: {
    type: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    required: true,
  },
  extra_fees: {
    type: String,
    required: true,
  },
  total_price: {
    type: String,
    required: true,
  },
  order_status: {
    type: [
      {
        code: { type: Number },
        status: { type: String },
        check: { type: Boolean, default: false },
        date: { type: String, default: "-" },
      },
    ],
    default: [
      { code: 1, status: "Order Placed", check: true, date: "-" },
      { code: 2, status: "Order Confirmed", check: false, date: "-" },
      { code: 3, status: "Shipped", check: false, date: "-" },
      { code: 4, status: "Delivered", check: false, date: "--" },
    ],
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
