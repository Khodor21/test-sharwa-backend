const Order = require("../models/Order");
const Product = require("../models/Product");
const { handleResponse, handleError } = require("../utils/helpers");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id", "name email")
      .populate("products.product_id");

    // Transform products: replace product_id with product
    const transformedOrders = orders.map((order) => {
      const transformedProducts = order.products.map((p) => {
        return {
          ...p._doc,
          product: p.product_id, // new key
          product_id: undefined, // remove old key
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
      .populate("products.product_id");

    if (!order) {
      return handleResponse(res, null, 404, "Order not found");
    }
    handleResponse(res, order);
  } catch (error) {
    handleError(res, error);
  }
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      code,
      items_count,
      user_id,
      customer_name,
      phone,
      district,
      address,
      products,
      extra_fees,
      total_price,
    } = req.body;

    // Validate products and calculate total price
    const productIds = products.map((p) => p.product_id);
    const productDetails = await Product.find({ _id: { $in: productIds } });

    if (productDetails.length !== products.length) {
      return handleResponse(
        res,
        null,
        400,
        "Some products are invalid or missing"
      );
    }

    // Calculate total price from product prices and quantities
    let calculatedTotalPrice = productDetails.reduce((total, product) => {
      const matchedProduct = products.find(
        (p) => p.product_id === product._id.toString()
      );
      const productPrice = parseFloat(product.price || "0");
      const productQuantity = matchedProduct.quantity || 1;
      return total + productPrice * productQuantity;
    }, 0);

    // Add extra fees to the calculated total
    calculatedTotalPrice += parseFloat(extra_fees || "0");

    if (
      parseFloat(calculatedTotalPrice).toFixed(2) !==
      parseFloat(total_price).toFixed(2)
    ) {
      return handleResponse(
        res,
        {
          calculatedTotalPrice: calculatedTotalPrice.toFixed(2),
        },
        400,
        "Total price does not match the calculated total price"
      );
    }

    // Create the new order
    const newOrder = new Order({
      code,
      items_count,
      user_id,
      customer_name,
      phone,
      district,
      address,
      products,
      extra_fees,
      total_price,
    });

    const savedOrder = await newOrder.save();
    handleResponse(res, savedOrder, 201);
  } catch (error) {
    handleError(res, error);
  }
};

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
  getOrderById,
  createOrder,
  updateOrderStatus,
};
