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
} from "../controllers/appointmentController.js";

import Appointment from "../models/appointmentModel.js";
import protect from "../middlewares/authMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";

const router = express.Router();

/* ===========================
   PATIENT ROUTES
=========================== */

// ✅ Patient: Book appointment (date & time only)
router.post("/book", protect(), bookAppointment);

// ✅ Patient: Get my appointments
router.get("/my", protect(), getMyAppointments);

// ✅ Patient: Cancel appointment (only if pending)
router.put("/:id/cancel", protect(), cancelAppointment);


/* ===========================
   ADMIN ROUTES
=========================== */

// ✅ Admin: Get all appointments (optional status filter)
router.get("/", adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const appointments = await Appointment.find(filter)
      .populate("user", "name email")
      .populate("doctor", "name email speciality")
      .populate("services.service", "name price duration")
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

// ✅ Admin: Approve appointment (UNLOCKS doctor actions)
router.put("/:id/approve", adminAuthMiddleware, approveAppointment);

// ✅ Admin: Delete appointment
router.delete("/:id", adminAuthMiddleware, deleteAppointment);


/* ===========================
   DOCTOR ROUTES
=========================== */

// ✅ Doctor: Get my appointments
// Shows PENDING_ADMIN + APPROVED_ADMIN
router.get(
  "/doctor/my-appointments",
  doctorAuthMiddleware,
  getDoctorAppointments
);

// ✅ Doctor: Assign MULTIPLE services (only after admin approval)
router.put(
  "/doctor/:id/assign-services",
  doctorAuthMiddleware,
  doctorAssignServices
);

// ✅ Doctor: Complete appointment
router.put(
  "/doctor/:id/complete",
  doctorAuthMiddleware,
  completeAppointment
);

export default router;
