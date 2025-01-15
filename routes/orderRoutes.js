const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/order", orderController.createOrder);

router.get("/orders", orderController.getAllOrders);

router.get("/orders/:id", orderController.getOrderById);

router.post("/orders/update-status/:id", orderController.updateOrderStatus);

module.exports = router;
