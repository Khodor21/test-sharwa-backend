const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  handleResponse,
  handleError,
  calculateFinalPrice,
} = require("../utils/helpers");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id", "name email")
      .populate("products.id");

    // Transform products: replace product_id with product
    const transformedOrders = orders.map((order) => {
      const transformedProducts = order.products.map((p) => {
        return {
          ...p._doc,
          product: p.id, // new key
          selected_variations: p.selected_variations || {},

          id: undefined, // remove old key
        };
      });

      return {
        ...order._doc,
        products: transformedProducts,
      };
    });

    handleResponse(res, transformedOrders);
  } catch (error) {
    handleError(res, error);
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("user_id", "name email")
      .populate("products.id"); // Populate full product details

    if (!order) {
      return handleResponse(res, null, 404, "Order not found");
    }

    // Transform products to include final price
    const transformedProducts = order.products.map((p) => {
      const productData = p.id; // Full product doc from populate

      const final_price = calculateFinalPrice(
        productData.price,
        productData.discount,
        productData.discount_type
      );

      return {
        ...p._doc,
        product: {
          ...productData._doc,
          final_price: parseFloat(final_price.toFixed(2)), // Clean format
        },
        id: undefined, // remove the old populated id key
      };
    });

    const transformedOrder = {
      ...order._doc,
      products: transformedProducts,
    };

    handleResponse(res, transformedOrder, 200);
  } catch (error) {
    handleError(res, error);
  }
};

// Get order by ID
const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ user_id: userId }).sort({ _id: -1 });

    handleResponse(res, orders, 200);
  } catch (error) {
    handleError(res, error);
  }
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items_count,
      customer_name,
      phone,
      district,
      address,
      items,
      extra_fees,
      total_price,
    } = req.body;

    const productIds = items
      .map((p) => p._id || p.id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    const productDetails = await Product.find({ _id: { $in: productIds } });

    if (productDetails.length !== items.length) {
      return handleResponse(
        res,
        null,
        400,
        "Some products are invalid or missing"
      );
    }

    let calculatedTotalPrice = 0;
    for (const product of productDetails) {
      const matchedItem = items.find((p) => p.id === product._id.toString());
      const quantity = matchedItem.quantity || 1;

      // Stock check
      if (product.quantity < quantity) {
        return handleResponse(
          res,
          null,
          400,
          `Insufficient stock for product: ${product.title}`
        );
      }

      const finalPrice = calculateFinalPrice(
        product.price,
        product.discount,
        product.discount_type
      );

      calculatedTotalPrice += finalPrice * quantity;
    }

    calculatedTotalPrice += parseFloat(extra_fees || "0");

    if (
      parseFloat(calculatedTotalPrice).toFixed(2) !==
      parseFloat(total_price).toFixed(2)
    ) {
      return handleResponse(
        res,
        { calculatedTotalPrice: calculatedTotalPrice.toFixed(2) },
        400,
        "Total price does not match the calculated total price"
      );
    }

    // ✅ Update stock for each product
    for (const product of productDetails) {
      const matchedItem = items.find((p) => p.id === product._id.toString());
      const orderedQty = matchedItem.quantity || 1;
      product.quantity -= orderedQty;
      await product.save();
    }

    // ✅ Generate unique order code
    let uniqueCode;
    let isUnique = false;
    while (!isUnique) {
      uniqueCode = generateRandomCode(); // e.g., "AB1234"
      const existingOrder = await Order.findOne({ code: uniqueCode });
      if (!existingOrder) isUnique = true;
    }

    // ✅ Create and save the order
    const newOrder = new Order({
      code: uniqueCode,
      items_count,
      user_id: userId,
      customer_name,
      phone,
      district,
      address,
      products: items.map((item) => ({
        id: item.id || item._id,
        quantity: item.quantity || 1,
        selected_variations: item.selected_variations || {},
      })),
      extra_fees,
      total_price,
    });

    const savedOrder = await newOrder.save();
    return handleResponse(res, savedOrder, 201);
  } catch (error) {
    return handleError(res, error);
  }
};

// Utility function to generate a unique serial code
function generateRandomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllOrders,
  getMyOrders,
  createOrder,
  updateOrderStatus,
  getOrderById,
};
