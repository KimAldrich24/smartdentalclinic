import express from "express";
import { addDoctor, loginAdmin, allDoctors, removeDoctor, createAdmin } from "../controllers/adminController.js";
import { uploadDoctorImage } from "../middlewares/multer.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js"; // ✅ FIXED - default import
import { getAllPrescriptions } from "../controllers/prescriptionController.js";
import User from "../models/userModel.js";
import AuditTrail from "../models/auditModel.js";
import { addSchedule, getDoctorSchedule } from "../controllers/adminScheduleController.js";
import { getPatientCompletedAppointments } from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", createAdmin);

router.get("/check-admin", async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" });

    // 🔥 PREVENT CACHE
    res.set("Cache-Control", "no-store");

    res.json({
      success: true,
      exists: !!admin,
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
});

// ✅ FIXED - changed upload to uploadDoctorImage
router.post("/add-doctor", adminAuthMiddleware, uploadDoctorImage.single("image"), addDoctor);
router.get("/all-doctors", adminAuthMiddleware, allDoctors);
router.delete("/remove-doctor/:id", adminAuthMiddleware, removeDoctor);
router.get("/prescriptions", getAllPrescriptions);

// GET /api/admin/profile
router.get("/profile", adminAuthMiddleware, async (req, res) => {
  try {
    // ✅ use req.user.id
    const admin = await User.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone || "Not set",
        dob: admin.dob || null,
        role: admin.role,
        status: admin.status || "active",
      },
    });
  } catch (error) {
    console.error("GET /profile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.put("/profile", adminAuthMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const admin = await User.findByIdAndUpdate(
      req.user.id, // ✅ use req.user.id
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

// Save schedule for a doctor
router.post("/add-schedule", adminAuthMiddleware, addSchedule);

// Get schedule of a specific doctor
router.get("/doctor-schedule/:doctorId", adminAuthMiddleware, getDoctorSchedule);

// Add this line with the other router.get() calls
router.get("/appointments/admin/completed/:patientId", adminAuthMiddleware, getPatientCompletedAppointments);

export default router;