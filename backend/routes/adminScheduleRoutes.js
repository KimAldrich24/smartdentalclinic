import express from "express";
import Doctor from "../models/doctorModel.js"; // don't forget to import Doctor
import { authMiddleware, protect } from "../middlewares/authMiddleware.js";
import { addSchedule, getDoctorSchedule } from "../controllers/adminScheduleController.js";


const router = express.Router();

// Admin-only routes
router.post("/add-schedule", authMiddleware, protect(["admin"]), addSchedule);
router.get("/doctor-schedule/:doctorId", authMiddleware, protect(["admin"]), getDoctorSchedule);

// ✅ Doctor-only route to view their own schedule
router.get("/my-schedule", authMiddleware, protect(["doctor"]), async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.userId).select("schedule name");
      if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
  
      res.json({ success: true, schedule: doctor.schedule });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

export default router;
