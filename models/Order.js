const mongoose = require("mongoose");

// ✅ Single source of truth for status values
const ORDER_STATUS = Object.freeze({
  PROCESSING: "processing",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
});

const orderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      index: true, // ✅ faster lookups by order code
    },

    items_count: {
      type: Number,
      required: true,
      min: [1, "Order must have at least one item"],
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    customer_name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
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
          min: [1, "Quantity must be at least 1"],
        },
        selected_variations: {
          type: Object,
          default: {},
        },
      },
    ],

    extra_fees: {
      type: Number, // ✅ was String — math on strings causes bugs
      required: true,
      default: 0,
      min: 0,
    },

    total_price: {
      type: Number, // ✅ was String — never store money as String
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(ORDER_STATUS),
        message: "'{VALUE}' is not a valid order status", // ✅ clear error msg
      },
      default: ORDER_STATUS.PROCESSING, // ✅ "processing" — matches enum exactly
      index: true,
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
  },
);

// ✅ Compound index for common admin queries
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ user_id: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order, ORDER_STATUS };
