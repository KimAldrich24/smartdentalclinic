import express from "express";
import AuditTrail from "../models/auditModel.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// ✅ TEST ROUTE - Create a fake log
router.get("/test-create", async (req, res) => {
  try {
    const testLog = await AuditTrail.create({
      userId: "673fd9c35801cd4b9268f75a", // Your admin ID
      role: "admin",
      action: "TEST_LOGIN",
      module: "AUTH",
      ipAddress: "127.0.0.1",
    });
    
    console.log("✅ Test log created:", testLog);
    res.json({ success: true, message: "Test log created", log: testLog });
  } catch (error) {
    console.error("❌ Test log failed:", error);
    res.status(500).json({ success: false, message: error.message, error: error.stack });
  }
});

// GET all audit logs
router.get("/", async (req, res) => {
  try {
    console.log("📋 Fetching audit logs...");
    const logs = await AuditTrail.find()
      .populate("userId", "name email")
      .sort({ timestamp: -1 });
    
    console.log(`Found ${logs.length} audit logs`);
    res.json(logs);
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;