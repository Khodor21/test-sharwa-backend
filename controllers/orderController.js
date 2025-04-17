const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const { name, phone, items, subTotal, shippingCost, total, address_info } =
      req.body;

    const order = new Order({
      name,
      phone,
      items,
      subTotal,
      shippingCost,
      total,
      address_info,
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error.message);
    res.status(500).json({ error: "Failed to create order" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
};
