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
  getPatientCompletedAppointments,
  addPrescription,
  getPrescriptions,
} from "../controllers/appointmentController.js";

import protect from "../middlewares/authMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";

const router = express.Router();

/* ================= PATIENT ================= */
router.post("/book", protect(), bookAppointment);
router.get("/my", protect(), getMyAppointments);
router.put("/:id/cancel", protect(), cancelAppointment);

/* ================= ADMIN ================= */
router.get("/", adminAuthMiddleware, getAllAppointments);
router.get("/patient/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.params.id })
      .populate("user", "name email")
      .populate("doctor", "name email speciality")
      .populate("services.service", "name price duration")
      .sort({ date: -1, time: -1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
});
router.put("/:id/approve", adminAuthMiddleware, approveAppointment);
router.put("/:id/admin-complete", adminAuthMiddleware, adminCompleteAppointment);
router.delete("/:id", adminAuthMiddleware, deleteAppointment);

// Completed appointments
router.get("/admin/completed/:userId", adminAuthMiddleware, getPatientCompletedAppointments);

// Add prescription
router.post("/add/:patientId/:appointmentId", adminAuthMiddleware, addPrescription);

// Paginated prescriptions
router.get("/prescriptions", adminAuthMiddleware, getPrescriptions);

/* ================= DOCTOR ================= */
router.get("/doctor/my-appointments", doctorAuthMiddleware, getDoctorAppointments);
router.put("/doctor/:id/assign-services", doctorAuthMiddleware, doctorAssignServices);
router.put("/doctor/:id/complete", doctorAuthMiddleware, completeAppointment);

export default router;
