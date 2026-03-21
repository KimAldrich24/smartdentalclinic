import express from "express";
import Appointment from "../models/appointmentModel.js";

import {
  bookAppointment,
  bookChildAppointment, // ✅ NEW
  getMyAppointments,
  getAllAppointments,
  deleteAppointment,
  cancelAppointment,
  completeAppointment,
  getDoctorAppointments,
  approveAppointment,
  doctorAssignServices,
  adminCompleteAppointment,
  getPatientCompletedAppointments,
  addPrescription,
  getPrescriptions,
  addWalkInAppointment,
} from "../controllers/appointmentController.js";

import protect from "../middlewares/authMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";

const router = express.Router();

/* ================= PATIENT ================= */
// Book appointment
router.post("/book", protect(), bookAppointment);
// ✅ Book appointment for child (guardian)
router.post("/book-child", protect(), bookChildAppointment);
// Get my appointments
router.get("/my", protect(), getMyAppointments);
// Cancel appointment
router.put("/:id/cancel", protect(), cancelAppointment);

/* ================= ADMIN ================= */
// Get all appointments
router.get("/", adminAuthMiddleware, getAllAppointments);

// Get appointments for a specific patient
router.get("/patient/:userId", adminAuthMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.params.userId })
      .populate("user", "name email")
      .populate("doctor", "name email speciality")
      .populate("services.service", "name price duration")
      .sort({ date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
});

router.put("/:id/mark-paid", adminAuthMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    if (appointment.paymentStatus === "Paid") {
      return res.status(400).json({ success: false, message: "Payment is already marked as Paid" });
    }

    appointment.paymentStatus = "Paid";
    await appointment.save();

    res.json({ success: true, message: "Payment marked as Paid", appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve appointment
router.put("/:id/approve", adminAuthMiddleware, approveAppointment);

// Admin marks appointment complete
router.put("/:id/admin-complete", adminAuthMiddleware, adminCompleteAppointment);

// Delete appointment
router.delete("/:id", adminAuthMiddleware, deleteAppointment);

// Completed appointments for a patient
router.get("/admin/completed/:userId", adminAuthMiddleware, getPatientCompletedAppointments);

// Add prescription
router.post("/add/:patientId/:appointmentId", adminAuthMiddleware, addPrescription);

// Get prescriptions (paginated / filtered)
router.get("/prescriptions", adminAuthMiddleware, getPrescriptions);

/* ================= DOCTOR ================= */
// Get my appointments
router.get("/doctor/my-appointments", doctorAuthMiddleware, getDoctorAppointments);

// Assign services to appointment
router.put("/doctor/:id/assign-services", doctorAuthMiddleware, doctorAssignServices);

// Complete appointment
router.put("/doctor/:id/complete", doctorAuthMiddleware, completeAppointment);

// Only admin/receptionist can add walk-in appointments
router.post("/walk-in", protect(["admin", "receptionist"]), addWalkInAppointment);

// routes/appointmentRoutes.js
router.get("/doctor/my-appointments", protect(["doctor"]), async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.userId }) // req.userId = doctor ID
      .populate("patient", "name email phone")
      .populate("bookedBy", "name role")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
