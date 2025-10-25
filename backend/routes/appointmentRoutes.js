import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  deleteAppointment,
  cancelAppointment,
  completeAppointment,
  getDoctorAppointments,
} from "../controllers/appointmentController.js";
import Appointment from "../models/appointmentModel.js";
import protect from "../middlewares/authMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";

const router = express.Router();

// ✅ User: Book appointment
router.post("/book", protect(), bookAppointment);

// ✅ User: Get my appointments
router.get("/my", protect(), getMyAppointments);

// ✅ Admin: Get all appointments (with optional status filter)
router.get("/", adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = status ? { status } : {};
    
    const appointments = await Appointment.find(filter)
      .populate("user", "name email")
      .populate("doctor", "name email speciality")
      .sort({ date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
});

// ✅ Admin: Get appointments by patient ID
router.get("/patient/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointments = await Appointment.find({ user: id })
      .populate("user", "name email")
      .populate("doctor", "name email speciality")
      .sort({ date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    console.error("Error fetching patient appointments:", err);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
});

// ✅ Admin: Get all appointments (legacy route)
router.get("/all", adminAuthMiddleware, getAllAppointments);

// ✅ Admin: Delete appointment
router.delete("/:id", adminAuthMiddleware, deleteAppointment);

// ✅ Admin: Mark appointment as done
router.put("/:id/complete", adminAuthMiddleware, completeAppointment);

// ✅ Cancel appointment route (user can cancel their own)
router.put("/:id/cancel", protect(), cancelAppointment);

// ✅ Doctor routes
router.get("/doctor/my-appointments", doctorAuthMiddleware, getDoctorAppointments);

export default router;