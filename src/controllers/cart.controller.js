const Asynchandler = require("express-async-handler");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

exports.addToCart = Asynchandler(async (req, res) => {
  const { item } = req.body;
  const { productId, quantity } = item;

  if (quantity <= 0) {
    res.error("Quantity must be greater than zero");
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.error("Product with id ${productId} not found", 404);
  }
  // Check if requested quantity exceeds available stock
  if (quantity > product.quantity) {
    return res.error(
      `Quantity exceeds available stock. Only ${product.quantity} left.`
    );
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
    if (cartItem.quantity > product.quantity) {
      return res.error(
        `Quantity exceeds available stock. Only ${product.quantity} left.`
      );
    }
    cart.subtotal += cartItem.quantity * itemPrice;
    cart.total += cartItem.quantity * itemPrice;
  } else {
    cart.items.push({ productId, quantity });

    cart.subtotal += quantity * itemPrice;
    cart.total += quantity * itemPrice;
  }

  await cart.save();
  res.success(cart, "Product added to cart", 200);
});

exports.deleteProductFromCart = Asynchandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne();

  if (!cart) {
    return res.error("Cart not found", 404);
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.error(`Product with id ${productId} not found`, 404);
  }
  const cartItem = cart.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (!cartItem) {
    return res.error("Product not found in cart", 4040);
  }

  cart.subtotal -= cartItem.quantity * (product.salePrice || product.price);
  cart.total -= cartItem.quantity * (product.salePrice || product.price);

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );

  await cart.save();
  res.success(cart, "Product removed from cart", 200);
});

exports.updateQuantityInCart = Asynchandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne();

  if (!cart) {
    return res.error("Cart not found", 404);
  }
  const product = await Product.findById(productId);
  if (!product) {
    return res.error(`Product with id ${productId} not found`, 404);
  }

  const cartItem = cart.items.find(
    (item) => item.productId.toString() === productId.toString()
  );
  if (!cartItem) {
    return res.error("Product not found in cart", 404);
  }
  if (quantity > product.quantity) {
    return res.error(
      `Requested quantity exceeds available stock. Only ${product.quantity} available.`,
      400
    );
  }

  cart.subtotal -= cartItem.quantity * (product.salePrice || product.price);
  cart.total -= cartItem.quantity * (product.salePrice || product.price);

  cartItem.quantity = quantity * 1;

  cart.subtotal += cartItem.quantity * (product.salePrice || product.price);
  cart.total += cartItem.quantity * (product.salePrice || product.price);

  await cart.save();
  res.success(cart, "Cart updated successfully");
});
exports.getCartTotal = Asynchandler(async (req, res) => {
  const cart = await Cart.findOne().populate("items");
  if (!cart) {
    return res.error("Cart not found", 404);
  }

  res.success(
    {
      subtotal: cart.subtotal,
      total: cart.total,
      items: cart.items,
    },
    "Cart retrieved successfully",
    200
  );
});
