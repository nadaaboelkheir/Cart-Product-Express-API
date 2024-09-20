const express = require("express");
const router = express.Router();
const {
  addToCart,
  deleteProductFromCart,
  updateQuantityInCart,
  getCartTotal,
} = require("../controllers/cart.controller");
router.post("/", addToCart);
router.delete("/:productId", deleteProductFromCart);
router.put("/", updateQuantityInCart);
router.get("/", getCartTotal);

module.exports = router;
