function responseFormatter(req, res, next) {
  res.success = function (data, message = "Success", statusCode = 200) {
    res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  };

  res.error = function (message = "Error", statusCode = 400) {
    res.status(statusCode).json({
      status: "error",
      message,
    });
  };

  next();
}

module.exports = responseFormatter;
