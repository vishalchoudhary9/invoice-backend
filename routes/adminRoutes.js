import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

router.put("/users/:id/plan", async (req, res) => {
  try {
    const { subscriptionPlan } = req.body;
    
    if (!["free", "premium"].includes(subscriptionPlan)) {
      return res.status(400).json({
        message: "Invalid subscription plan",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscriptionPlan },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User plan updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user plan",
      error: error.message,
    });
  }
});

export default router;
