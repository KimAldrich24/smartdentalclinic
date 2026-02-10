import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  deleteAppointment,
  cancelAppointment,
  completeAppointment,
  getDoctorAppointments,
  approveAppointment,
  doctorAssignServices,
  adminCompleteAppointment,
  getPatientCompletedAppointments, // ✅
} from "../controllers/appointmentController.js";

import Appointment from "../models/appointmentModel.js";
import protect from "../middlewares/authMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";

const router = express.Router();

/* ===========================
   PATIENT ROUTES
=========================== */

// Book appointment
router.post("/book", protect(), bookAppointment);

// Get my appointments
router.get("/my", protect(), getMyAppointments);

// Cancel appointment
router.put("/:id/cancel", protect(), cancelAppointment);

/* ===========================
   ADMIN ROUTES
=========================== */

// Get all appointments
router.get("/", adminAuthMiddleware, getAllAppointments);

// Get appointments by patient ID
router.get("/patient/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.params.id })
      .populate("user", "name email")
      .populate("doctor", "name email speciality")
      .populate("services.service", "name price duration")
      .sort({ date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    console.error("Error fetching patient appointments:", err);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
});

// Approve appointment
router.put("/:id/approve", adminAuthMiddleware, approveAppointment);

// Delete appointment
router.delete("/:id", adminAuthMiddleware, deleteAppointment);

// Admin marks appointment complete
router.put("/:id/admin-complete", adminAuthMiddleware, adminCompleteAppointment);

/* ===========================
   DOCTOR ROUTES
=========================== */

// Get doctor's appointments
router.get("/doctor/my-appointments", doctorAuthMiddleware, getDoctorAppointments);

// Assign multiple services
router.put("/doctor/:id/assign-services", doctorAuthMiddleware, doctorAssignServices);

// Complete appointment
router.put("/doctor/:id/complete", doctorAuthMiddleware, completeAppointment);

/* ===========================
   COMPLETED APPOINTMENTS
=========================== */

// Patient view (protected)
router.get("/completed/:userId", protect(), getPatientCompletedAppointments);

// Admin view (protected)
router.get("/admin/completed/:userId", adminAuthMiddleware, getPatientCompletedAppointments);

export default router;
