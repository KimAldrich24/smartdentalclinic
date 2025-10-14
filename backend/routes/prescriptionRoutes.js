import express from "express";
import Prescription from "../models/prescriptionModel.js";
import Appointment from "../models/appointmentModel.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ============================
   🔹 GET ALL PRESCRIPTIONS (Admin only)
=============================== */
router.get("/", adminAuthMiddleware, async (req, res) => {
  try {
    console.log("🩺 GET /api/prescriptions (Admin)");

    const prescriptions = await Prescription.find()
      .populate("doctor", "name email")
      .populate("patient", "name email");

    console.log(`✅ Returning ${prescriptions.length} prescriptions for admin`);
    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("❌ Error fetching prescriptions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
    });
  }
});

/* ============================
   🔹 GET PRESCRIPTIONS BY PATIENT ID (Patient or Admin)
=============================== */
router.get("/patient/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🩺 GET /api/prescriptions/patient/:id");
    console.log("→ Logged in user:", req.user);
    console.log("→ Requested patient ID:", id);

    if (!id) {
      console.log("⚠️ Missing patient ID");
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const isSelf = req.user.id?.toString() === id?.toString();
    const isAdmin = req.user.role === "admin";

    if (!isSelf && !isAdmin) {
      console.log("❌ Unauthorized: Patient ID mismatch");
      return res.status(403).json({
        success: false,
        message: "Unauthorized access — patient ID mismatch",
      });
    }

    const prescriptions = await Prescription.find({ patient: id })
      .populate("doctor", "name email")
      .populate("patient", "name email");

    console.log(`✅ Found ${prescriptions.length} prescriptions for patient ${id}`);

    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("❌ Error fetching patient prescriptions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
    });
  }
});

/* ============================
   🔹 ADD NEW PRESCRIPTION (Linked to Appointment)
=============================== */
router.post(
  "/add/:patientId/:appointmentId",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const { patientId, appointmentId } = req.params;
      const { medicines, notes } = req.body;

      console.log("💊 POST /api/prescriptions/add");
      console.log("→ patientId:", patientId, "appointmentId:", appointmentId);

      if (!patientId || !appointmentId) {
        return res.status(400).json({
          success: false,
          message: "Missing patientId or appointmentId",
        });
      }

      const appointment = await Appointment.findById(appointmentId).populate("doctor");
      if (!appointment) {
        console.log("⚠️ Appointment not found");
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      if (!appointment.doctor) {
        console.log("⚠️ Appointment has no doctor assigned");
        return res.status(400).json({
          success: false,
          message: "Appointment has no doctor assigned",
        });
      }

      const prescription = new Prescription({
        patient: patientId,
        doctor: appointment.doctor._id,
        medicines,
        notes,
        dateIssued: new Date(),
      });

      await prescription.save();

      const populatedPrescription = await Prescription.findById(prescription._id)
        .populate("doctor", "name email")
        .populate("patient", "name email");

      console.log("✅ Prescription created:", populatedPrescription);

      res.status(201).json({ success: true, prescription: populatedPrescription });
    } catch (err) {
      console.error("❌ Error adding prescription:", err);
      res.status(500).json({
        success: false,
        message: "Failed to add prescription",
      });
    }
  }
);

/* ============================
   🔹 GET LOGGED-IN PATIENT PRESCRIPTIONS
=============================== */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.id; // from JWT token
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID from token",
      });
    }

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate("doctor", "name email")
      .populate("patient", "name email")
      .sort({ dateIssued: -1 }); // optional: latest first

    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("❌ Error fetching patient prescriptions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
    });
  }
});

export default router;
