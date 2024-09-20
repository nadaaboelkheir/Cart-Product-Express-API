const Asynchandler = require("express-async-handler");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

exports.addToCart = Asynchandler(async (req, res) => {
  const { item } = req.body;
  const { productId, quantity } = item;

  if (quantity <= 0) {
    return res
      .status(400)
      .json({ message: "Quantity must be greater than zero" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ message: `Product with id ${productId} not found` });
  }
  // Check if requested quantity exceeds available stock
  if (quantity > product.quantity) {
    return res
      .status(400)
      .json({
        message: `Quantity exceeds available stock. Only ${product.quantity} left.`,
      });
  }

  let cart = await Cart.findOne();
  if (!cart) {
    cart = new Cart({ items: [], subtotal: 0, total: 0 });
  }

  const cartItem = cart.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  const itemPrice = product.salePrice || product.price;

  if (cartItem) {
    cart.subtotal -= cartItem.quantity * itemPrice;
    cart.total -= cartItem.quantity * itemPrice;

    cartItem.quantity += quantity * 1;

    cart.subtotal += cartItem.quantity * itemPrice;
    cart.total += cartItem.quantity * itemPrice;
  } else {
    cart.items.push({ productId, quantity });

    cart.subtotal += quantity * itemPrice;
    cart.total += quantity * itemPrice;
  }

  try {
    await cart.save();
    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to save cart", error });
  }
});

exports.deleteProductFromCart = Asynchandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne();

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ message: `Product with id ${productId} not found` });
  }
  const cartItem = cart.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (!cartItem) {
    return res.status(404).json({ message: "Product not found in cart" });
  }

  cart.subtotal -= cartItem.quantity * (product.salePrice || product.price);
  cart.total -= cartItem.quantity * (product.salePrice || product.price);

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  try {
    await cart.save();
    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart", error });
  }
});

exports.updateQuantityInCart = Asynchandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne();

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ message: `Product with id ${productId} not found` });
  }

  const cartItem = cart.items.find(
    (item) => item.productId.toString() === productId.toString()
  );
  if (!cartItem) {
    return res.status(404).json({ message: "Product not found in cart" });
  }
  if (quantity > product.quantity) {
    return res
      .status(400)
      .json({
        message: `Requested quantity exceeds available stock. Only ${product.quantity} available.`,
      });
  }

  cart.subtotal -= cartItem.quantity * (product.salePrice || product.price);
  cart.total -= cartItem.quantity * (product.salePrice || product.price);

  cartItem.quantity = quantity * 1;

  cart.subtotal += cartItem.quantity * (product.salePrice || product.price);
  cart.total += cartItem.quantity * (product.salePrice || product.price);

  try {
    await cart.save();
    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart", error });
  }
});
exports.getCartTotal = Asynchandler(async (req, res) => {
  const cart = await Cart.findOne().populate("items");
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  res.status(200).json({
    subtotal: cart.subtotal,
    total: cart.total,
    items: cart.items,
  });
});
