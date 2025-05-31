const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyToken = require("../utils/VerifyToken");

//try to fix github error

router.post("/order", verifyToken, orderController.createOrder);

router.get("/orders", orderController.getAllOrders);

router.get("/my-orders", verifyToken, orderController.getMyOrders);

router.post("/orders/update-status/:id", orderController.updateOrderStatus);

module.exports = router;
