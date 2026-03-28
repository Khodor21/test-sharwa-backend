const mongoose = require("mongoose");
const { Order, ORDER_STATUS } = require("../models/Order");
const sendTelegramMessage = require("../utils/telegram");
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
        productData.discount_type,
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

// Get orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ user_id: userId }).sort({ _id: -1 });

    handleResponse(res, orders, 200);
  } catch (error) {
    handleError(res, error);
  }
};

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      userId,
      items_count,
      customer_name,
      phone,
      district,
      address,
      city,
      items,
      extra_fees,
      total_price,
      paid_from_delivery,
    } = req.body;

    // ─── 1. Validate required fields ────────────────────────────────────────
    const missingFields = [];
    if (!customer_name?.trim()) missingFields.push("Name");
    if (!phone?.trim()) missingFields.push("Phone");
    if (!city?.trim()) missingFields.push("City");
    if (!address?.trim()) missingFields.push("Address");

    if (missingFields.length > 0) {
      await session.abortTransaction(); // ✅ always clean up session
      session.endSession();
      return handleResponse(
        res,
        null,
        400,
        `Please fill required fields: ${missingFields.join(", ")}`,
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return handleResponse(res, null, 400, "No products in order");
    }

    // ─── 2. Validate numeric inputs early ───────────────────────────────────
    const parsedExtraFees = parseFloat(extra_fees ?? 0);
    const parsedTotalPrice = parseFloat(total_price);

    if (isNaN(parsedExtraFees) || parsedExtraFees < 0) {
      await session.abortTransaction();
      session.endSession();
      return handleResponse(res, null, 400, "Invalid extra_fees value");
    }
    if (isNaN(parsedTotalPrice) || parsedTotalPrice < 0) {
      await session.abortTransaction();
      session.endSession();
      return handleResponse(res, null, 400, "Invalid total_price value");
    }

    // ─── 3. Normalize item IDs ───────────────────────────────────────────────
    const normalizedItems = items.map((item) => {
      let id = null;
      if (item._id && typeof item._id === "object" && "$oid" in item._id) {
        id = item._id.$oid;
      } else if (typeof item._id === "string") {
        id = item._id;
      } else if (item.id) {
        id = String(item.id);
      }
      return { ...item, id };
    });

    const invalidItems = normalizedItems.filter((p) => !p.id);
    if (invalidItems.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return handleResponse(
        res,
        { invalidItems },
        400,
        "Some products are missing IDs",
      );
    }

    // ─── 4. Validate ObjectIds before DB hit ────────────────────────────────
    const invalidObjectIds = normalizedItems.filter(
      (p) => !mongoose.Types.ObjectId.isValid(p.id),
    );
    if (invalidObjectIds.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return handleResponse(res, null, 400, "Some product IDs are malformed");
    }

    const productIds = normalizedItems.map(
      (p) => new mongoose.Types.ObjectId(p.id),
    );

    // ─── 5. Fetch products (single DB call) ─────────────────────────────────
    const productDetails = await Product.find({
      _id: { $in: productIds },
    }).session(session);

    const foundIds = new Set(productDetails.map((p) => p._id.toString())); // ✅ O(1) lookup
    const missingIds = normalizedItems
      .map((p) => p.id)
      .filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return handleResponse(
        res,
        { missingIds },
        400,
        "Some products not found",
      );
    }

    // ─── 6. Stock validation + price calculation ─────────────────────────────
    const productMap = new Map(
      productDetails.map((p) => [p._id.toString(), p]),
    ); // ✅ O(1) product lookup instead of nested .filter()

    let calculatedTotalPrice = 0;

    for (const item of normalizedItems) {
      const product = productMap.get(item.id);
      const quantity = Math.max(1, parseInt(item.quantity) || 1);

      // Global stock check
      if (product.quantity < quantity) {
        await session.abortTransaction();
        session.endSession();
        return handleResponse(
          res,
          null,
          400,
          `Insufficient stock for: ${product.title}`,
        );
      }

      // Variant stock check
      if (item.variations?.length && product.variations?.length) {
        for (const selVar of item.variations) {
          const variation = product.variations.find(
            (v) => v.name === selVar.name,
          );
          if (!variation) continue;

          const option = variation.options.find(
            (o) => o.label === selVar.selected,
          );
          if (!option) continue;

          if (option.quantity < quantity) {
            await session.abortTransaction();
            session.endSession();
            return handleResponse(
              res,
              null,
              400,
              `Insufficient stock for variant "${selVar.selected}" of "${selVar.name}" in: ${product.title}`,
            );
          }
        }
      }

      const finalPrice = calculateFinalPrice(
        product.price,
        product.discount,
        product.discount_type,
      );
      calculatedTotalPrice += finalPrice * quantity;
    }

    calculatedTotalPrice += parsedExtraFees;

    // ✅ Tolerance-based comparison to handle floating point drift (e.g. 0.1 + 0.2)
    if (Math.abs(calculatedTotalPrice - parsedTotalPrice) > 0.01) {
      await session.abortTransaction();
      session.endSession();
      return handleResponse(
        res,
        { calculatedTotalPrice: +calculatedTotalPrice.toFixed(2) },
        400,
        "Total price mismatch",
      );
    }

    // ─── 7. Deduct stock ─────────────────────────────────────────────────────
    const savePromises = [];

    for (const item of normalizedItems) {
      const product = productMap.get(item.id);
      const quantity = Math.max(1, parseInt(item.quantity) || 1);

      product.quantity = Math.max(0, product.quantity - quantity);

      if (item.variations?.length && product.variations?.length) {
        for (const selVar of item.variations) {
          const varObj = product.variations.find((v) => v.name === selVar.name);
          if (!varObj) continue;
          const option = varObj.options.find(
            (o) => o.label === selVar.selected,
          );
          if (!option) continue;
          option.quantity = Math.max(0, option.quantity - quantity);
        }
      }

      savePromises.push(product.save({ session }));
    }

    await Promise.all(savePromises); // ✅ parallel saves instead of sequential

    // ─── 8. Create order ─────────────────────────────────────────────────────
    const newOrder = new Order({
      items_count,
      user_id: userId || null,
      customer_name: customer_name.trim(),
      phone: phone.trim(),
      district: district?.trim(),
      address: address.trim(),
      city: city.trim(),
      products: normalizedItems.map((item) => ({
        id: item.id,
        quantity: Math.max(1, parseInt(item.quantity) || 1),
        selected_variations: item.variations || {},
      })),
      extra_fees: parsedExtraFees, // ✅ Number, not String
      total_price: parsedTotalPrice, // ✅ Number, not String
      status: ORDER_STATUS.PROCESSING, // ✅ "processing" — safe constant
      paid_from_delivery: Boolean(paid_from_delivery),
      order_date: (() => {
        const d = new Date();
        return `${d.getDate()}-${d.getMonth() + 1}`;
      })(),
    });

    const savedOrder = await newOrder.save({ session });

    savedOrder.code = savedOrder._id.toString().slice(0, 6);
    await savedOrder.save({ session });

    // ─── 9. Commit before side effects ──────────────────────────────────────
    await session.commitTransaction();
    session.endSession();

    // ✅ Telegram runs AFTER commit — a notification failure won't roll back the order
    sendTelegramMessage(`
<b>🚨 طلب جديد!</b>
👤 <b>الاسم:</b> ${customer_name.trim()}
📞 <b>الهاتف:</b> ${phone.trim()}
📍 <b>المنطقة:</b> ${district} - ${address.trim()}
🏙️ <b>المدينة:</b> ${city.trim()}
🧾 <b>الكود:</b> ${savedOrder.code}
🛒 <b>المنتجات:</b> ${items_count}
💰 <b>الإجمالي:</b> ${parsedTotalPrice}$
📅 <b>الوقت:</b> ${new Date().toLocaleString()}
`).catch((err) =>
      console.error(
        "[Telegram] Notification failed (non-critical):",
        err.message,
      ),
    ); // ✅ fire-and-forget with silent catch

    return handleResponse(res, savedOrder, 201);
  } catch (error) {
    // ✅ Guard: don't abort an already-committed transaction
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    return handleError(res, error);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paid_from_delivery } = req.body;

    const validStatuses = ["accepted", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) {
      order.status = status;
      console.log("🟡 Status updated to:", status);
    }

    if (typeof paid_from_delivery === "boolean") {
      order.paid_from_delivery = paid_from_delivery;
      console.log("🟡 paid_from_delivery updated to:", paid_from_delivery);
    }

    // ✅ Save updated order
    await order.save();
    console.log("💾 Order saved successfully:", order._id);

    res.status(200).json({ message: "Order updated", data: order });
  } catch (error) {
    console.error("🔥 Backend error in updateOrderStatus:", error);
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
