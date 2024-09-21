const express = require("express");
const router = express.Router();
const {
  addToCart,
  deleteProductFromCart,
  updateQuantityInCart,
  getCartTotal,
} = require("../controllers/cart.controller");
const { productIdValidation } = require("../validations/common.vc");

router.post("/", addToCart);
router.delete("/:productId", productIdValidation, deleteProductFromCart);
router.put("/:productId", productIdValidation, updateQuantityInCart);
router.get("/", getCartTotal);

module.exports = router;
