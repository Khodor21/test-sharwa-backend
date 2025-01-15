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

module.exports = {
  handleError,
  handleResponse,
};
