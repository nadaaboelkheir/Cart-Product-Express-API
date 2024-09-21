const Asynchandler = require("express-async-handler");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const { validateProductQuantity, updateCartTotals } = require("../utils/functions");

exports.addToCart = Asynchandler(async (req, res) => {
  const { productId, quantity } = req.body.item;

  if (quantity <= 0) return res.error("Quantity must be greater than zero", 400);

  const product = await Product.findById(productId);
  if (!product) return res.error(`Product with id ${productId} not found`, 404);

  const error = validateProductQuantity(quantity, product.quantity);
  if (error) return res.error(error, 400);

  let cart = await Cart.findOne();
  if (!cart) {
    cart = new Cart({ items: [], subtotal: 0, total: 0 });
  }

  const cartItem = cart.items.find(item => item.productId.toString() === productId.toString());
  const itemPrice = product.salePrice || product.price;

  if (cartItem) {
    cart.subtotal -= cartItem.quantity * itemPrice;
    cart.total -= cartItem.quantity * itemPrice;

    cartItem.quantity += quantity*1;
    if (cartItem.quantity > product.quantity) {
      return res.error(
        `Quantity exceeds available stock. Only ${product.quantity} left.`
      );
    }

  } else {
    cart.items.push({ productId, quantity });
  }

  await updateCartTotals(cart, Product);
  res.success(cart, "Product added to cart", 200);
});

exports.deleteProductFromCart = Asynchandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne();
  if (!cart) return res.error("Cart not found", 404);

  const cartItem = cart.items.find(item => item.productId.toString() === productId.toString());
  if (!cartItem) return res.error("Product not found in cart", 404);

  cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());

  await updateCartTotals(cart, Product);
  res.success(cart, "Product removed from cart", 200);
});

exports.updateQuantityInCart = Asynchandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne();
  if (!cart) return res.error("Cart not found", 404);

  const product = await Product.findById(productId);
  if (!product) return res.error(`Product with id ${productId} not found`, 404);

  const cartItem = cart.items.find(item => item.productId.toString() === productId.toString());
  if (!cartItem) return res.error("Product not found in cart", 404);

  const error = validateProductQuantity(quantity, product.quantity);
  if (error) return res.error(error, 400);

  cartItem.quantity = quantity*1;

  await updateCartTotals(cart, Product);
  res.success(cart, "Cart updated successfully", 200);
});

exports.getCartTotal = Asynchandler(async (req, res) => {
  const cart = await Cart.findOne().populate("items");
  if (!cart) return res.error("Cart not found", 404);

  res.success({
    subtotal: cart.subtotal,
    total: cart.total,
    items: cart.items,
  }, "Cart retrieved successfully", 200);
});
