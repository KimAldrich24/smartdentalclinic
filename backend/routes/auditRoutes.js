import express from "express";
import AuditTrail from "../models/auditModel.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js"; // or your current admin/staff auth

const router = express.Router();

// GET all audit logs
//router.get("/", adminAuthMiddleware, async (req, res) => {
    router.get("/", async (req, res) => {
  try {
    const logs = await AuditTrail.find()
      .populate("userId", "name email")
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
