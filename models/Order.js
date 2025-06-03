const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
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
    products: [
      {
        id: {
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
    extra_fees: {
      type: String,
      required: true,
    },
    total_price: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
