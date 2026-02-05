import Doctor from "../models/doctorModel.js";

// ----------------- Add / Update Schedule -----------------
export const addSchedule = async (req, res) => {
  try {
    const { doctorId, schedule } = req.body;

    if (!doctorId || !schedule)
      return res.status(400).json({ success: false, message: "Doctor and schedule are required" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // schedule is expected as: { "2026-02-06": ["10:00", "11:00"] }
    const date = Object.keys(schedule)[0];
    const slots = schedule[date].map((time) => time); // array of strings

    if (!date || slots.length === 0)
      return res.status(400).json({ success: false, message: "Date and slots are required" });

    // Check if this date already exists in doctor's schedule
    const existingIndex = doctor.schedule.findIndex((s) => s.date === date);

    if (existingIndex !== -1) {
      // Merge new slots with existing ones (avoid duplicates)
      const existingSlots = doctor.schedule[existingIndex].slots;
      const mergedSlots = Array.from(new Set([...existingSlots, ...slots]));
      doctor.schedule[existingIndex].slots = mergedSlots;
    } else {
      // Add new date schedule
      doctor.schedule.push({ date, slots });
    }

    await doctor.save();

    res.json({ success: true, schedule: doctor.schedule });
  } catch (err) {
    console.error("Error adding schedule:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------- Get Doctor Schedule -----------------
export const getDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const doctor = await Doctor.findById(doctorId).select("schedule name");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    res.json({ success: true, schedule: doctor.schedule });
  } catch (err) {
    console.error("Error fetching doctor schedule:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------- Mark slot as available again -----------------
export const makeSlotAvailable = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { date, time } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const scheduleItem = doctor.schedule.find((s) => s.date === date);
    if (!scheduleItem) return res.status(404).json({ success: false, message: "Date not found in schedule" });

    // Check if slot exists
    if (!scheduleItem.slots.includes(time)) return res.status(404).json({ success: false, message: "Slot not found" });

    // ✅ For simplicity, we'll keep slot in the array (no separate "finished" status in schema)
    // You could also add a `status` field if needed for tracking finished slots

    res.json({ success: true, schedule: doctor.schedule });
  } catch (err) {
    console.error("Error updating slot:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
