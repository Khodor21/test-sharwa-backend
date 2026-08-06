const mongoose = require("mongoose");
const sendTelegramMessage = require("../utils/telegram");
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

      // --- 1. Validate required fields ---
      if (
        !customer_name?.trim() ||
        !phone?.trim() ||
        !district?.trim() ||
        !city?.trim() ||
        !address?.trim()
      ) {
        return handleResponse(
          res,
          null,
          400,
          "Please fill all required fields: Name, Phone, District, City, Address",
        );
      }

      if (!Array.isArray(items) || items.length === 0) {
        return handleResponse(res, null, 400, "No products in order");
      }

      // --- 2. Normalize item IDs ---
      const normalizedItems = items.map((item) => {
        let id = null;
        if (item._id && typeof item._id === "object" && "$oid" in item._id) {
          id = item._id.$oid;
        } else if (typeof item._id === "string") {
          id = item._id;
        } else if (item.id) {
          id = item.id;
        }
        return { ...item, id };
      });

      const invalidItems = normalizedItems.filter((p) => !p.id);
      if (invalidItems.length > 0) {
        return handleResponse(
          res,
          { invalidItems },
          400,
          "Some products are missing IDs",
        );
      }

      // --- 3. Fetch products from DB ---
      const productIds = normalizedItems
        .map((p) => p.id)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      const productDetails = await Product.find({
        _id: { $in: productIds },
      }).session(session);

      const foundIds = productDetails.map((p) => p._id.toString());
      const missingIds = normalizedItems
        .map((p) => p.id.toString())
        .filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        return handleResponse(
          res,
          { missingIds },
          400,
          "Some products are invalid",
        );
      }

      // --- 4. Validate stock and calculate total price ---
      let calculatedTotalPrice = 0;
      for (const product of productDetails) {
        const matchedItems = normalizedItems.filter(
          (p) => p.id.toString() === product._id.toString(),
        );

        for (const matchedItem of matchedItems) {
          const quantity = matchedItem.quantity || 1;

          if (product.quantity < quantity) {
            return handleResponse(
              res,
              null,
              400,
              `Insufficient stock for product: ${product.title}`,
            );
          }

          // Check variants stock
          if (matchedItem.variations && product.variations) {
            for (const selVar of matchedItem.variations) {
              const varIndex = product.variations.findIndex(
                (v) => v.name === selVar.name,
              );
              if (varIndex !== -1) {
                const optionIndex = product.variations[
                  varIndex
                ].options.findIndex((opt) => opt.label === selVar.selected);
                if (optionIndex !== -1) {
                  if (
                    product.variations[varIndex].options[optionIndex].quantity <
                    quantity
                  ) {
                    return handleResponse(
                      res,
                      null,
                      400,
                      `Insufficient stock for variant ${selVar.selected} of ${selVar.name} in product: ${product.title}`,
                    );
                  }
                }
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
      }

      calculatedTotalPrice += parseFloat(extra_fees || 0);

      if (
        parseFloat(calculatedTotalPrice).toFixed(2) !==
        parseFloat(total_price).toFixed(2)
      ) {
        return handleResponse(
          res,
          { calculatedTotalPrice: calculatedTotalPrice.toFixed(2) },
          400,
          "Total price does not match the calculated total price",
        );
      }

      // --- 5. Update product stock safely ---
      for (const product of productDetails) {
        const matchedItems = normalizedItems.filter(
          (p) => p.id.toString() === product._id.toString(),
        );

        for (const matchedItem of matchedItems) {
          const qty = matchedItem.quantity || 1;
          product.quantity -= qty;

          if (matchedItem.variations && product.variations) {
            matchedItem.variations.forEach((selVar) => {
              const varIndex = product.variations.findIndex(
                (v) => v.name === selVar.name,
              );
              if (varIndex !== -1) {
                const optionIndex = product.variations[
                  varIndex
                ].options.findIndex((opt) => opt.label === selVar.selected);
                if (optionIndex !== -1) {
                  product.variations[varIndex].options[optionIndex].quantity -=
                    qty;
                  if (
                    product.variations[varIndex].options[optionIndex].quantity <
                    0
                  ) {
                    product.variations[varIndex].options[optionIndex].quantity =
                      0;
                  }
                }
              }
            });
          }
        }

        await product.save({ session });
      }

      // --- 6. Create the order ---
      const newOrder = new Order({
        items_count,
        user_id: userId || null,
        customer_name,
        phone,
        district,
        address,
        city,
        products: normalizedItems.map((item) => ({
          id: item.id,
          quantity: item.quantity || 1,
          selected_variations: item.variations || {},
        })),
        extra_fees,
        total_price,
        paid_from_delivery: paid_from_delivery || false, // ✅ store value
        order_date: (() => {
          // ✅ store day-month
          const d = new Date();
          return `${d.getDate()}-${d.getMonth() + 1}`;
        })(),
      });

      const savedOrder = await newOrder.save({ session });
      savedOrder.code = savedOrder._id.toString().slice(0, 6);
      await savedOrder.save({ session });

      // ==========================================
      // 🚨 التعديل الجوهري هنا لرفع الأداء (Performance Fix)
      // ==========================================

      // ✅ 7. إنهاء الـ Transaction فوراً لفك القفل (Lock) عن المنتجات للمستخدمين الآخرين
      await session.commitTransaction();
      session.endSession();

      // ✅ 8. إرسال إشعار التليجرام بالخلفية بدون إيقاف الطلب وبدون إبقاء المنتج مقفولاً
      // (أزلنا كلمة await واستخدمنا .catch لكي لا يضرب السيرفر إذا كان التليجرام معطلاً)
      sendTelegramMessage(`
<b>🚨 طلب جديد!</b>
👤 <b>الاسم:</b> ${customer_name}
📞 <b>الهاتف:</b> ${phone}
📍 <b>المنطقة:</b> ${district} - ${address}
🏙️ <b>المدينة:</b> ${city}
🧾 <b>الكود:</b> ${savedOrder.code}
🛒 <b>المنتجات:</b> ${items_count}
💰 <b>الإجمالي:</b> ${total_price}$
📅 <b>الوقت:</b> ${new Date().toLocaleString()}
`).catch((err) => console.error("Telegram notification failed:", err));

      // ✅ 9. الخروج وإرجاع الاستجابة الناجحة للمستخدم فوراً
      return handleResponse(res, savedOrder, 201);
    } catch (error) {
      // التراجع عن التعديلات في حال حدوث أي خطأ
      await session.abortTransaction();
      session.endSession();

      // فحص إذا كان الخطأ بسبب الضغط المتزامن (Write Conflict)
      if (
        error.hasErrorLabel &&
        error.hasErrorLabel("TransientTransactionError") &&
        attempt < MAX_RETRIES
      ) {
        console.log(
          `⚠️ Write conflict detected. Retrying attempt ${attempt + 1}...`,
        );
        // ننتظر قليلاً ثم نعيد المحاولة بصمت (الانتظار يزيد تدريجياً مع كل محاولة)
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
        continue;
      }

      // إذا استنفدنا المحاولات أو كان الخطأ برمجياً عادياً، نعيده للواجهة
      console.error("🔥 Order creation failed:", error);
      return handleError(res, error);
    }
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
