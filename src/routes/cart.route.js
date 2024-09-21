const express = require("express");
const router = express.Router();
const {
  addToCart,
  deleteProductFromCart,
  updateQuantityInCart,
  getCartTotal,
} = require("../controllers/cart.controller");
const { idValidation } = require("../validations/common.vc");

router.post("/", addToCart);
router.delete("/:productId", idValidation, deleteProductFromCart);
router.put("/", updateQuantityInCart);
router.get("/", getCartTotal);

module.exports = router;
