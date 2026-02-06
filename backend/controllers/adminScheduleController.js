import Doctor from "../models/doctorModel.js";

export const addSchedule = async (req, res) => {
  try {
    const { doctorId, schedule } = req.body;
    if (!doctorId || !schedule)
      return res.status(400).json({ success: false, message: "Doctor and schedule are required" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    doctor.schedule = Array.isArray(doctor.schedule) ? doctor.schedule : [];

    // normalize existing slots
    doctor.schedule.forEach(s => {
      if (Array.isArray(s.slots)) {
        s.slots = s.slots.map(slot =>
          typeof slot === "string" ? { time: slot, status: "available" } : slot
        );
      } else {
        s.slots = [];
      }
    });

    const date = Object.keys(schedule)[0];
    const slotTimes = Array.isArray(schedule[date]) ? schedule[date] : [];
    if (!date || slotTimes.length === 0)
      return res.status(400).json({ success: false, message: "Date and slots are required" });

    const newSlots = slotTimes.map(time => ({ time, status: "available" }));

    const existingIndex = doctor.schedule.findIndex(s => s.date === date);

    if (existingIndex !== -1) {
      const existingSlots = doctor.schedule[existingIndex].slots;
      const mergedSlots = [
        ...existingSlots,
        ...newSlots.filter(s => !existingSlots.some(e => e.time === s.time)),
      ];
      doctor.schedule[existingIndex].slots = mergedSlots;
    } else {
      doctor.schedule.push({ date, slots: newSlots });
    }

    await doctor.save();
    res.json({ success: true, schedule: doctor.schedule });
  } catch (err) {
    console.error("❌ ADD SCHEDULE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------- Get Doctor Schedule -----------------
export const getDoctorSchedule = async (req, res) => {
  try {
    // Use doctorId from params if admin
    const doctorId = req.params.doctorId || req.doctor?._id;

    const doctor = await Doctor.findById(doctorId).select("schedule name");
    if (!doctor)
      return res.status(404).json({ success: false, message: "Doctor not found" });

    res.json({ success: true, schedule: doctor.schedule });
  } catch (err) {
    console.error("Error fetching doctor schedule:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const makeSlotAvailable = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { date, time } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const scheduleItem = doctor.schedule.find(s => s.date === date);
    if (!scheduleItem) return res.status(404).json({ success: false, message: "Date not found in schedule" });

    const slot = scheduleItem.slots.find(s => s.time === time);
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });

    slot.status = "available"; // mark finished slot as available
    await doctor.save();

    res.json({ success: true, schedule: doctor.schedule });
  } catch (err) {
    console.error("Error updating slot:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
