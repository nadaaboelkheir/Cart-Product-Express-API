const validatorMiddleware = require("../middlewares/validators.mw");
const { param } = require("express-validator");

exports.idValidation = [
  param("id").isMongoId().withMessage("Invalid MongoDB ObjectId"),
  validatorMiddleware,
];
