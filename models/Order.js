const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
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
    city: {
      type: String,
      required: true,
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
        selected_variations: {
          type: Object,
          default: {},
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
      enum: ["Processing", "Completed", "Rejected"],
      default: "Processing",
    },

    paid_from_delivery: {
      type: Boolean,
      default: false,
    },

    order_date: {
      type: String,
      default: () => {
        const d = new Date();
        return `${d.getDate()}-${d.getMonth() + 1}`;
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
