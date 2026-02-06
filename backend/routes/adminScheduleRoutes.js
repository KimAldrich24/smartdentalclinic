import express from "express";
import Doctor from "../models/doctorModel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addSchedule, getDoctorSchedule, makeSlotAvailable } from "../controllers/adminScheduleController.js";

const router = express.Router();

// Schedule routes (any logged-in user for now)
router.post("/add-schedule", authMiddleware, addSchedule);
router.get("/doctor-schedule/:doctorId", authMiddleware, getDoctorSchedule);
router.patch("/slot-available/:doctorId", authMiddleware, makeSlotAvailable);

// Doctor-only route to view their own schedule
router.get("/my-schedule", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.userId).select("schedule name");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    res.json({ success: true, schedule: doctor.schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
