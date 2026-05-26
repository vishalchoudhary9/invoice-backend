import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    hsnSac: {
      type: String,
      default: "",
    },
    qty: {
      type: Number,
      default: 1,
    },
    rate: {
      type: Number,
      default: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    taxPercent: {
      type: Number,
      default: 18,
    },
    taxableAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceDate: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      default: "",
    },
    customerGstNumber: {
      type: String,
      default: "",
    },
    customerPan: {
      type: String,
      default: "",
    },
    customerAddress: {
      type: String,
      default: "",
    },
    placeOfSupply: {
      type: String,
      default: "",
    },
    poNumber: {
      type: String,
      default: "",
    },
    items: [invoiceItemSchema],
    taxableAmount: {
      type: Number,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;