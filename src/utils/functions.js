const fs = require("fs");

exports.removeImage = (imagePath) => {
  if (imagePath) {
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Failed to delete image:", err);
      }
    });
  }
};

exports.updateCartTotals = async (cart, product) => {
  let newSubtotal = 0;
  let newTotal = 0;

  for (let cartItem of cart.items) {
    const itemProduct = await product.findById(cartItem.productId);
    if (!itemProduct) continue;

    const itemPrice = itemProduct.salePrice || itemProduct.price;
    newSubtotal += cartItem.quantity * itemPrice;
    newTotal += cartItem.quantity * itemPrice;
  }

  cart.subtotal = newSubtotal;
  cart.total = newTotal;

  return cart.save();
};

// Function to check if quantity exceeds available stock
exports.validateProductQuantity = (quantity, stock) => {
  if (quantity > stock) {
    return `Requested quantity exceeds available stock. Only ${stock} available.`;
  }
  return null;
};
