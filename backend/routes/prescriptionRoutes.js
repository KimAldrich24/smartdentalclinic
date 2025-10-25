import express from "express";
import Prescription from "../models/prescriptionModel.js";
import Appointment from "../models/appointmentModel.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ============================
   🔹 GET LOGGED-IN PATIENT PRESCRIPTIONS (MUST BE FIRST!)
=============================== */
router.get("/my", protect(), async (req, res) => {
  try {
    console.log("🔍 GET /api/prescriptions/my - Request received!");
    console.log("→ User from token:", req.user);
    
    const patientId = req.user._id || req.user.id;

    if (!patientId) {
      return res.status(400).json({ success: false, message: "Invalid patient ID from token" });
    }

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate("doctor", "name email speciality")
      .populate("patient", "name email")
      .sort({ dateIssued: -1 });

    console.log("✅ Found", prescriptions.length, "prescriptions for patient", patientId);

    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("❌ Error fetching patient prescriptions:", err);
    res.status(500).json({ success: false, message: "Failed to fetch prescriptions" });
  }
});

/* ============================
   🔹 GET ALL PRESCRIPTIONS (Admin only) - Paginated
=============================== */
router.get("/", adminAuthMiddleware, async (req, res) => {
  console.log("🔍 GET /api/prescriptions - Request received!");
  console.log("→ Query params:", req.query);
  console.log("→ User from token:", req.user);
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log("→ Fetching prescriptions...");

    const [prescriptions, total] = await Promise.all([
      Prescription.find()
        .sort({ dateIssued: -1 })
        .skip(skip)
        .limit(limit)
        .populate("doctor", "name email")
        .populate("patient", "name email")
        .lean(),
      Prescription.countDocuments(),
    ]);

    console.log("✅ Found", prescriptions.length, "prescriptions");

    res.json({
      success: true,
      prescriptions,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("❌ Error in GET /api/prescriptions:", err);
    res.status(500).json({ success: false, message: "Failed to fetch prescriptions" });
  }
});

/* ============================
   🔹 GET PRESCRIPTIONS BY PATIENT ID (Patient or Admin)
=============================== */
router.get("/patient/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log("🩺 GET /api/prescriptions/patient/:id");
    console.log("→ Logged in user:", user);
    console.log("→ Requested patient ID:", id);

    if (!id) {
      return res.status(400).json({ success: false, message: "Patient ID is required" });
    }

    const isSelf = (user._id?.toString() || user.id?.toString()) === id?.toString();
    const isAdmin = user.role === "admin";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access — patient ID mismatch" });
    }

    const prescriptions = await Prescription.find({ patient: id })
      .populate("doctor", "name email")
      .populate("patient", "name email")
      .sort({ dateIssued: -1 });

    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("❌ Error fetching patient prescriptions:", err);
    res.status(500).json({ success: false, message: "Failed to fetch prescriptions" });
  }
});

/* ============================
   🔹 ADD NEW PRESCRIPTION (Linked to Appointment)
=============================== */
router.post("/add/:patientId/:appointmentId", adminAuthMiddleware, async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const { medicines, notes } = req.body;

    if (!patientId || !appointmentId) {
      return res.status(400).json({ success: false, message: "Missing patientId or appointmentId" });
    }

    const appointment = await Appointment.findById(appointmentId).populate("doctor");
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (!appointment.doctor) {
      return res.status(400).json({ success: false, message: "Appointment has no doctor assigned" });
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

    res.status(201).json({ success: true, prescription: populatedPrescription });
  } catch (err) {
    console.error("❌ Error adding prescription:", err);
    res.status(500).json({ success: false, message: "Failed to add prescription" });
  }
});

export default router;