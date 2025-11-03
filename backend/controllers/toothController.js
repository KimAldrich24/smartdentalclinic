import ToothTreatment from '../models/toothTreatmentModel.js';

// Add tooth treatment (Doctor only)
export const addToothTreatment = async (req, res) => {
  try {
    const { patientId, toothNumber, notes, appointmentId } = req.body;
    const doctorId = req.doctor._id; // From auth middleware

    const treatment = await ToothTreatment.create({
      patientId,
      doctorId,
      toothNumber,
      notes,
      appointmentId
    });

    res.json({ success: true, treatment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all treatments for a patient
export const getPatientTreatments = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const treatments = await ToothTreatment.find({ patientId })
      .populate('doctorId', 'name')
      .sort('-treatmentDate');

    res.json({ success: true, treatments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};