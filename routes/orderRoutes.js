const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/orders", createOrder);
router.get("/orders", getAllOrders);
router.get("/order/:id", getOrderById);
router.post("/orders/update-status/:id", updateOrderStatus);

module.exports = router;
