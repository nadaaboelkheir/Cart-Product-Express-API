const Asynchandler = require("express-async-handler");
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");
const { removeImage, updateCartTotals } = require("../utils/functions");

exports.createProduct = Asynchandler(async (req, res) => {
  if (!req.file) {
    return res.error("Please upload an image.", 400);
  }

  const { name, description, price, salePrice, quantity } = req.body;
  const image = req.file.path;

  const product = await Product.create({
    name,
    description,
    price,
    salePrice,
    image,
    quantity,
  });
  res.success(product, "Product created successfully", 201);
});

exports.getProductById = Asynchandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.error("Product not found", 404);

  res.success(product);
});

exports.getAllProducts = Asynchandler(async (req, res) => {
  const products = await Product.find();
  res.success(products);
});

exports.updateProduct = Asynchandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, salePrice, quantity } = req.body;

  const product = await Product.findById(id);
  if (!product) return res.error("Product not found", 404);

  if (req.file) {
    const image = req.file.path;
    if (product.image) {
      removeImage(product.image);
    }
    product.image = image;
  }

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.salePrice = salePrice || product.salePrice;
  product.quantity = quantity || product.quantity;

  await product.save();

  const carts = await Cart.find({ "items.productId": product._id });
  for (let cart of carts) {
    await updateCartTotals(cart, Product);
  }

  res.success(
    product,
    "Product updated successfully and reflected in carts",
    200
  );
});

exports.deleteProduct = Asynchandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);
  if (!product) return res.error("Product not found", 404);

  removeImage(product.image);

  const carts = await Cart.find();
  await Promise.all(
    carts.map(async (cart) => {
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== id.toString()
      );
      await updateCartTotals(cart, Product);
    })
  );

  res.success(
    product._id,
    "Product deleted successfully and carts updated",
    200
  );
});
