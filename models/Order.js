const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  items: [
    {
      id: String,
      title: String,
      image: String,
      price: Number,
      quantity: Number,
    },
  ],
  address_info: {
    address: { type: String },
    district: { type: String },
    city: { type: String },
  },
  subTotal: { type: Number },
  shippingCost: { type: Number },
  total: { type: Number },
  status: {
    type: String,
    enum: ["pending", "confirmed", "delivered"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
