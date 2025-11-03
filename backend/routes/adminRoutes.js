import express from "express";
import { addDoctor, loginAdmin, allDoctors, removeDoctor, createAdmin } from "../controllers/adminController.js";
import { uploadDoctorImage } from "../middlewares/multer.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js"; // ✅ FIXED - default import
import { getAllPrescriptions } from "../controllers/prescriptionController.js";
import User from "../models/userModel.js";
import AuditTrail from "../models/auditModel.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", createAdmin);

router.get("/check-admin", async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    res.json({ exists: !!admin });
  } catch (error) {
    res.status(500).json({ exists: false, message: error.message });
  }
});

// ✅ FIXED - changed upload to uploadDoctorImage
router.post("/add-doctor", adminAuthMiddleware, uploadDoctorImage.single("image"), addDoctor);
router.get("/all-doctors", adminAuthMiddleware, allDoctors);
router.delete("/remove-doctor/:id", adminAuthMiddleware, removeDoctor);
router.get("/prescriptions", getAllPrescriptions);

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