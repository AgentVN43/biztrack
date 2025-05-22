const ProductService = require("./product.service");

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    console.error("🚀 ~ product.controller.js: getAllProducts - Error:", err);
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const product = await ProductService.getProductById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    console.error("🚀 ~ product.controller.js: getProductById - Error:", err);
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const result = await ProductService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: "Product created",
      product_id: result.product_id,
    });
  } catch (err) {
    console.error("🚀 ~ product.controller.js: createProduct - Error:", err);
    if (err.message.includes("Invalid category_id")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await ProductService.updateProduct(id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found or no changes made",
      });
    }
    res.json({ success: true, message: "Product updated" });
  } catch (err) {
    console.error("🚀 ~ product.controller.js: updateProduct - Error:", err);
    if (err.message.includes("Invalid category_id")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await ProductService.deleteProduct(id);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("🚀 ~ product.controller.js: deleteProduct - Error:", err);
    next(err);
  }
};

// Hàm này đã được chuyển sang ProductModel và không còn là controller
// exports.updateStockFields = ...
