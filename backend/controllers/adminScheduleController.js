import Doctor from "../models/doctorModel.js";

// Add or update schedule for a doctor
export const addSchedule = async (req, res) => {
  try {
    const { doctorId, schedule } = req.body;

    if (!doctorId || !schedule) {
      return res.status(400).json({ success: false, message: "Doctor ID and schedule are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    doctor.schedule = schedule;
    await doctor.save();

    res.json({ success: true, message: "Schedule updated successfully", doctor });
  } catch (err) {
    console.error("Error adding schedule:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get schedule for a doctor
export const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId).select("schedule name");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    res.json({ success: true, schedule: doctor.schedule || {} });
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
