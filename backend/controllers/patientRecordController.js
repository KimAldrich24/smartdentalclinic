// controllers/patientRecordController.js
import PatientRecord from "../models/patientRecordModel.js";

export const addRecord = async (req, res) => {
  try {
    const { userId, doctorId, serviceId, notes } = req.body;

    const newRecord = await PatientRecord.create({
      user: userId,
      doctor: doctorId,
      service: serviceId,
      notes,
    });

    res.json({ success: true, record: newRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserRecords = async (req, res) => {
  try {
    const { userId } = req.params;

    const records = await PatientRecord.find({ user: userId })
      .populate("service")
      .populate("doctor", "name")
      .sort({ date: -1 });

    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
