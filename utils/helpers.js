const handleResponse = (res, data, statusCode = 200, message = null) => {
  return res.status(statusCode).json({
    success: true,
    message: message || "Operation successful",
    data: data,
  });
};

const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  return res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
  });
};
// Utility to calculate final price
const calculateFinalPrice = (price, discount, discountType) => {
  const numericPrice = parseFloat(price) || 0;
  const numericDiscount = parseFloat(discount) || 0;

  if (discountType === "percentage") {
    return numericPrice - (numericPrice * numericDiscount) / 100;
  } else if (discountType === "value") {
    return numericPrice - numericDiscount;
  }
  return numericPrice;
};

module.exports = {
  handleError,
  handleResponse,
  calculateFinalPrice,
  