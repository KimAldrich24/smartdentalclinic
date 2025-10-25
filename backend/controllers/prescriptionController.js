import Prescription from "../models/prescriptionModel.js";

// ✅ Admin creates a prescription for a patient
export const createPrescription = async (req, res) => {
  try {
    const { patient, doctor, medicines, notes } = req.body;

    const prescription = await Prescription.create({
      patient,
      doctor,
      medicines,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription,
    });
  } catch (err) {
    console.error("Create prescription error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get all prescriptions (admin use)
export const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("doctor")
      .populate("patient");
    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get MY prescriptions (patient use)
export const getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const prescriptions = await Prescription.find({ patient: userId })
      .populate("doctor", "name speciality") // Only get doctor name and speciality
      .sort({ dateIssued: -1 }); // Newest first

    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("Get my prescriptions error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};