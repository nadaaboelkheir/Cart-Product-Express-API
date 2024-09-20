const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Product Name"],
    trim: true,
    maxlength: [100, "Product Name cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please Enter Product Description"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter Product Price"],
    default: 0.0,
  },
  salePrice: {
    type: Number,
    default: 0.0,
  },
  image: {
    type: String,
    required: [true, "Please Enter Product Image"],
  },
  quantity: {
    type: Number,
    required: [true, "Please Enter Product Quantity"],
    min: [0, "Quantity cannot be less than 0"],

    default: 0,
  },
});
module.exports = mongoose.model("Product", ProductSchema);
