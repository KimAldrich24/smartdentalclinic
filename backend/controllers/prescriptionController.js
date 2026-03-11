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
      .populate("patient", "name email")   // populate patient info
      .populate("doctor", "name email speciality") // populate doctor info
      .sort({ dateIssued: -1 });           // newest first

    res.json({
      success: true,
      prescriptions,
    });
  } catch (err) {
    console.error("Get all prescriptions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get MY prescriptions (patient use)
export const getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const prescriptions = await Prescription.find({ patient: userId })
      .populate("patient", "name email")          // ✅ populate patient info
      .populate("doctor", "name speciality email") // ✅ populate doctor info
      .sort({ dateIssued: -1 });                 // newest first

    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("Get my prescriptions error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};