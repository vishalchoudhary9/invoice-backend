import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true, 
    },
    hsnSac: {
      type: String,
      trim: true,
      default: "",
    },
    rate: {
      type: Number,
      required: true,
      default: 0,
    },
    taxPercent: {
      type: Number,
      default: 18,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;