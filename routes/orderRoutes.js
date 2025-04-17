const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders } = require("../controllers/orderController");

router.post("/orders", createOrder);
router.get("/orders", getAllOrders);

module.exports = router;
