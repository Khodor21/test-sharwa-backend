/**
 * Send a structured success response
 */
const handleResponse = (res, data, statusCode = 200, message = null) => {
  return res.status(statusCode).json({
    success: statusCode < 400, // ✅ reflects actual outcome
    message: message || "Operation successful",
    data: data,
  });
};

/**
 * Send a structured error response with safe logging
 */
const handleError = (res, error, statusCode = 500) => {
  // ✅ Mongoose validation errors → 400, not 500
  const status =
    error.name === "ValidationError"
      ? 400
      : error.name === "CastError"
        ? 400
        : error.code === 11000
          ? 409 // duplicate key
          : statusCode;

  // ✅ Never leak stack traces to client
  const clientMessage =
    error.name === "ValidationError"
      ? Object.values(error.errors)
          .map((e) => e.message)
          .join(", ")
      : error.message || "Something went wrong";

  console.error(
    `[${new Date().toISOString()}] ${error.name}: ${error.message}`,
  );

  return res.status(status).json({
    success: false,
    message: clientMessage,
  });
};

/**
 * Calculate final price after discount
 * @returns {number} Always returns a non-negative number
 */
const calculateFinalPrice = (price, discount, discountType) => {
  const numericPrice = Math.max(0, parseFloat(price) || 0);
  const numericDiscount = Math.max(0, parseFloat(discount) || 0);

  let finalPrice = numericPrice;

  if (discountType === "percentage") {
    const pct = Math.min(numericDiscount, 100); // ✅ cap at 100%
    finalPrice = numericPrice - (numericPrice * pct) / 100;
  } else if (discountType === "value") {
    finalPrice = numericPrice - numericDiscount;
  }

  return Math.max(0, finalPrice); // ✅ never negative
};

module.exports = { handleError, handleResponse, calculateFinalPrice };
