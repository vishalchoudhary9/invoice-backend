import express from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ products });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
      error: error.message,
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productName, hsnSac, rate, taxPercent } = req.body;

    if (!productName) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    const product = await Product.create({
      owner: req.user._id,
      productName,
      hsnSac: hsnSac || "",
      rate: Number(rate) || 0,
      taxPercent: Number(taxPercent) || 0,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { productName, hsnSac, rate, taxPercent } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.productName = productName || product.productName;
    product.hsnSac = hsnSac || "";
    product.rate = Number(rate) || 0;
    product.taxPercent = Number(taxPercent) || 0;

    await product.save();

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

export default router;