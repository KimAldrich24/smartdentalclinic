import express from "express";
import { addDoctor, loginAdmin, allDoctors, removeDoctor, createAdmin } from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import { getAllPrescriptions } from "../controllers/prescriptionController.js";
import User from "../models/userModel.js";
import AuditTrail from "../models/auditModel.js"; // ✅ ADD THIS

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", createAdmin);

// ✅ ADD THIS: Check if admin exists
router.get("/check-admin", async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    res.json({ exists: !!admin });
  } catch (error) {
    res.status(500).json({ exists: false, message: error.message });
  }
});

router.post("/add-doctor", adminAuthMiddleware, upload.single("image"), addDoctor);
router.get("/all-doctors", adminAuthMiddleware, allDoctors);
router.delete("/remove-doctor/:id", adminAuthMiddleware, removeDoctor);
router.get("/prescriptions", getAllPrescriptions);

// ✅ ADD THIS: Get admin profile
router.get("/profile", adminAuthMiddleware, async (req, res) => {
  try {
    const admin = await User.findById(req.userId).select("-password");
    
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, admin });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// ✅ ADD THIS: Update admin profile
router.put("/profile", adminAuthMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const admin = await User.findByIdAndUpdate(
      req.userId,
      { name, phone },
      { new: true }
    ).select("-password");
    
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    // ✅ Log the update
    await AuditTrail.create({
      userId: admin._id,
      role: "admin",
      action: "UPDATE_PROFILE",
      module: "ADMIN",
      ipAddress: req.ip || "unknown",
    });

    res.json({ success: true, message: "Profile updated successfully", admin });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default router;