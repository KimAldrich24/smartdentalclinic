import express from "express";
import {
  sendOtp,
  sendEmailOtp,
  verifyAndRegister,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  getPendingUsers,
  approveUser,
  rejectUser,
  // ✅ New child functions
  addChild,
  getChildren
} from "../controllers/userController.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import protect from "../middlewares/authMiddleware.js";
import { getUserRecords } from "../controllers/patientRecordController.js";

const router = express.Router();

// =======================
// Public routes
// =======================
router.post("/send-otp", sendOtp);
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-and-register", verifyAndRegister);
router.post("/login", loginUser);

// =======================
// Authenticated routes (all users)
// =======================
router.get("/me", protect(), getCurrentUser);
router.put("/me", protect(), updateUserProfile);

// =======================
// Guardian: Child management
// =======================
router.post("/children", protect(), addChild); // Add child
router.get("/children", protect(), getChildren); // Get all children

// =======================
// Become Guardian
// =======================
router.put("/become-guardian", protect(), async (req, res) => {
  try {
    const user = req.user;

    if (user.role === "guardian") {
      return res.status(400).json({ success: false, message: "You are already a guardian." });
    }

    user.role = "guardian";
    await user.save();

    res.status(200).json({ success: true, message: "You are now a guardian!", role: user.role });
  } catch (err) {
    console.error("[ERROR] becomeGuardian:", err.message);
    res.status(500).json({ success: false, message: "Failed to become guardian", error: err.message });
  }
});

// =======================
// Admin-only routes
// =======================
router.get("/", adminAuthMiddleware, getAllUsers);
router.delete("/:id", adminAuthMiddleware, deleteUser);
router.get("/pending", adminAuthMiddleware, getPendingUsers);
router.put("/approve/:id", adminAuthMiddleware, approveUser);
router.put("/reject/:id", adminAuthMiddleware, rejectUser);

// =======================
// User-specific routes
// =======================
router.get("/:id/patient-records", protect(), getUserRecords);

export default router;