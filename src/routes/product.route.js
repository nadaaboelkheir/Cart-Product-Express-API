const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { uploadSingle } = require("../middlewares/multer");

router.post("/", uploadSingle, createProduct);
router.get("/:id", getProductById);
router.get("/", getAllProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
