const validatorMiddleware = require("../middlewares/validators.mw");
const { check } = require("express-validator");

exports.createProductValidation = [
  check("name")
    .notEmpty()
    .withMessage("Please Enter Product Name")
    .isLength({ max: 100 })
    .withMessage("Product Name cannot exceed 100 characters"),
  check("description")
    .notEmpty()
    .withMessage("Please Enter Product Description"),
  check("price")
    .notEmpty()
    .withMessage("Please Enter Product Price")
    .isNumeric()
    .withMessage("Price must be a number"),
  check("salePrice")
    .optional()
    .isNumeric()
    .withMessage("Sale Price must be a number"),
  check("quantity")
    .notEmpty()
    .withMessage("Please Enter Product Quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity cannot be less than 0"),
  validatorMiddleware,
];

