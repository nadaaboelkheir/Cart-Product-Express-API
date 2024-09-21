const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { createProductValidation } = require("../validations/product.vc");

const { idValidation } = require("../validations/common.vc");
const { uploadSingle } = require("../middlewares/multer");

router.post("/", uploadSingle,createProductValidation, createProduct);
router.get("/:id", idValidation, getProductById);
router.get("/", getAllProducts);
router.put("/:id", uploadSingle, idValidation, updateProduct);
router.delete("/:id", idValidation, uploadSingle, deleteProduct);

module.exports = router;
