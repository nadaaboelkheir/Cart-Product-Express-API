const Asynchandler = require("express-async-handler");
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");
const fs = require("fs");
exports.createProduct = Asynchandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload an image." });
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

  res.status(201).json({
    message: "Product created successfully",
    product: product,
  });
});
exports.getProductById = Asynchandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(404).json({
      message: "Product not found",
    });
  } else {
    res.status(200).json({
      product: product,
    });
  }
});
exports.getAllProducts = Asynchandler(async (req, res) => {
  const products = await Product.find();
  res.status(200).json({
    products: products,
  });
});
exports.updateProduct = Asynchandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, salePrice, quantity } = req.body;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  let image;
  if (req.file) {
    image = req.file.path;

    if (image !== product.image) {
      if (product.image) {
        fs.unlink(product.image, (err) => {
          if (err) {
            console.error("Failed to delete old image:", err);
          }
        });
      }
      product.image = image;
    }
  }
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.salePrice = salePrice || product.salePrice;
  product.quantity = quantity || product.quantity;

  await product.save();

  const carts = await Cart.find({ "items.productId": product._id });

  for (let cart of carts) {
    let newSubtotal = 0;
    let newTotal = 0;

    for (let cartItem of cart.items) {
      const itemProduct = await Product.findById(cartItem.productId);

      if (!itemProduct) {
        continue;
      }

      if (cartItem.productId.toString() === product._id.toString()) {
        cartItem.productName = name || itemProduct.name;
        cartItem.productDescription = description || itemProduct.description;
        cartItem.productImage = image || itemProduct.image;
        cartItem.productQuantity = quantity || itemProduct.quantity;
      }

      const itemPrice = itemProduct.salePrice || itemProduct.price;
      newSubtotal += cartItem.quantity * itemPrice;
      newTotal += cartItem.quantity * itemPrice;
    }

    cart.subtotal = newSubtotal;
    cart.total = newTotal;

    await cart.save();
  }

  res.status(200).json({
    message: "Product updated successfully and reflected in carts",
    product: product,
  });
});

exports.deleteProduct = Asynchandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }
  if (product.image) {
    fs.unlink(product.image, (err) => {
      if (err) {
        console.error("Failed to delete image:", err);
      }
    });
  }

  const carts = await Cart.find();

  await Promise.all(
    carts.map(async (cart) => {
      const cartItem = cart.items.find(
        (item) => item.productId.toString() === id.toString()
      );

      if (cartItem) {
        cart.subtotal -=
          cartItem.quantity * (product.salePrice || product.price);
        cart.total -= cartItem.quantity * (product.salePrice || product.price);

        cart.items = cart.items.filter(
          (item) => item.productId.toString() !== id.toString()
        );

        try {
          await cart.save();
        } catch (error) {
          console.error(`Failed to update cart ${cart._id}:`, error);
        }
      }
    })
  );

  res.status(200).json({
    message: "Product deleted successfully, and carts updated",
  });
});
