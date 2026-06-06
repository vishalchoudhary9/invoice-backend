import express from "express";
import Invoice from "../models/Invoice.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const calculateInvoice = (items) => {
  let taxableAmount = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const calculatedItems = items.map((item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const discountPercent = Number(item.discountPercent) || 0;
    const taxPercent = Number(item.taxPercent) || 0;

    const grossAmount = qty * rate;
    const discountAmount = (grossAmount * discountPercent) / 100;
    const itemTaxableAmount = grossAmount - discountAmount;
    const taxAmount = (itemTaxableAmount * taxPercent) / 100;
    const totalAmount = itemTaxableAmount + taxAmount;

    taxableAmount += itemTaxableAmount;
    totalDiscount += discountAmount;
    totalTax += taxAmount;

    return {
      productName: item.productName,
      hsnSac: item.hsnSac || "",
      qty,
      rate,
      discountPercent,
      taxPercent,
      taxableAmount: itemTaxableAmount,
      taxAmount,
      totalAmount,
    };
  });

  return {
    calculatedItems,
    taxableAmount,
    totalDiscount,
    totalTax,
    grandTotal: taxableAmount + totalTax,
  };
};

router.get("/", authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ invoices });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get invoices",
      error: error.message,
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json({ invoice });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get invoice",
      error: error.message,
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      invoiceNumber,
      invoiceDate,
      customerName,
      customerPhone,
      customerGstNumber,
      customerPan,
      customerAddress,
      placeOfSupply,
      poNumber,
      items,
    } = req.body;

    if (!invoiceNumber || !invoiceDate || !customerName) {
      return res.status(400).json({
        message: "Invoice number, date and customer name are required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "At least one item is required",
      });
    }

    // Check if user is blocked
    if (req.user.subscriptionPlan === "blocked") {
      return res.status(403).json({
        message: "Your account is blocked because you have reached the 5-invoice generation limit. Please contact the developer to unlock or upgrade.",
      });
    }

    // Check free limit
    if (req.user.subscriptionPlan === "free") {
      if (req.user.totalInvoicesGenerated >= 5) {
        req.user.subscriptionPlan = "blocked";
        await req.user.save();
        return res.status(403).json({
          message: "Your account is blocked because you have reached the 5-invoice generation limit. Please contact the developer to unlock or upgrade.",
        });
      }
    }

    const {
      calculatedItems,
      taxableAmount,
      totalDiscount,
      totalTax,
      grandTotal,
    } = calculateInvoice(items);

    const invoice = await Invoice.create({
      owner: req.user._id,
      invoiceNumber,
      invoiceDate,
      customerName,
      customerPhone: customerPhone || "",
      customerGstNumber: customerGstNumber || "",
      customerPan: customerPan || "",
      customerAddress: customerAddress || "",
      placeOfSupply: placeOfSupply || "",
      poNumber: poNumber || "",
      items: calculatedItems,
      taxableAmount,
      totalDiscount,
      totalTax,
      grandTotal,
    });

    if (req.user.subscriptionPlan === "free") {
      req.user.totalInvoicesGenerated = (req.user.totalInvoicesGenerated || 0) + 1;
      if (req.user.totalInvoicesGenerated >= 5) {
        req.user.subscriptionPlan = "blocked";
      }
      await req.user.save();
    }

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        subscriptionPlan: req.user.subscriptionPlan,
        totalInvoicesGenerated: req.user.totalInvoicesGenerated,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create invoice",
      error: error.message,
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
});

export default router;