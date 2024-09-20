const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
});

const CartSchema = new mongoose.Schema({
  items: [cartItemSchema],
  total: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
});
module.exports = mongoose.model("Cart", CartSchema);
