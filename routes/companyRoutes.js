import express from "express";
import Company from "../models/Company.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user._id });

    res.json({
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get company profile",
      error: error.message,
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      companyName,
      gstNumber,
      phone,
      email,
      address,
      bankName,
      accountNumber,
      ifscCode,
      branch,
      logo,
      stampSign,
    } = req.body;

    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    let company = await Company.findOne({ owner: req.user._id });

    if (company) {
      company.companyName = companyName;
      company.gstNumber = gstNumber || "";
      company.phone = phone || "";
      company.email = email || "";
      company.address = address || "";
      company.bankName = bankName || "";
      company.accountNumber = accountNumber || "";
      company.ifscCode = ifscCode || "";
      company.branch = branch || "";
      company.logo = logo || "";
      company.stampSign = stampSign || "";

      await company.save();
    } else {
      company = await Company.create({
        owner: req.user._id,
        companyName,
        gstNumber: gstNumber || "",
        phone: phone || "",
        email: email || "",
        address: address || "",
        bankName: bankName || "",
        accountNumber: accountNumber || "",
        ifscCode: ifscCode || "",
        branch: branch || "",
        logo: logo || "",
        stampSign: stampSign || "",
      });
    }

    res.json({
      message: "Company profile saved successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save company profile",
      error: error.message,
    });
  }
});

export default router;