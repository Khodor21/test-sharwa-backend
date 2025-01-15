const Order = require("../models/Order");
const Product = require("../models/Product");
const { handleResponse, handleError } = require("../utils/helpers");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id", "name email")
      .populate("products");
    handleResponse(res, orders);
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
      .populate("products");

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
    const { code, check, date } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return handleResponse(res, null, 404, "Order not found");
    }

    const currentStatusIndex = order.order_status.findIndex(
      (status) => status.code === code
    );

    if (currentStatusIndex === -1) {
      return handleResponse(res, null, 404, "Status code not found in order");
    }

    // Check if the previous status in the sequence is unchecked
    if (currentStatusIndex > 0) {
      const previousStatus = order.order_status[currentStatusIndex - 1];
      if (!previousStatus.check) {
        return handleResponse(
          res,
          null,
          400,
          `Cannot update status "${order.order_status[currentStatusIndex].status}" because the previous status "${previousStatus.status}" is not checked`
        );
      }
    }

    // Update the specific status
    const statusToUpdate = order.order_status[currentStatusIndex];
    if (check !== undefined) statusToUpdate.check = check;
    if (date) statusToUpdate.date = date;

    await order.save();
    handleResponse(res, order);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
};
