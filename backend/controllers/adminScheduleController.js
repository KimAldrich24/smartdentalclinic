import Doctor from "../models/doctorModel.js";

// ----------------- Add / Update Schedule -----------------
export const addSchedule = async (req, res) => {
  try {
    const { doctorId, schedule } = req.body;

    if (!doctorId || !schedule) {
      return res.status(400).json({
        success: false,
        message: "Doctor and schedule are required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // ✅ IMPORTANT FIX
    if (!doctor.schedule) {
      doctor.schedule = [];
    }

    // expected: { "YYYY-MM-DD": ["10:00", "11:00"] }
    const date = Object.keys(schedule)[0];
    const slots = schedule[date].map((time) => ({
      time,
      status: "available",
    }));

    if (!date || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Date and slots are required",
      });
    }

    const existingIndex = doctor.schedule.findIndex(
      (s) => s.date === date
    );

    if (existingIndex !== -1) {
      const existingSlots = doctor.schedule[existingIndex].slots;

      const mergedSlots = [
        ...existingSlots,
        ...slots.filter(
          (newSlot) =>
            !existingSlots.some((s) => s.time === newSlot.time)
        ),
      ];

      doctor.schedule[existingIndex].slots = mergedSlots;
    } else {
      doctor.schedule.push({ date, slots });
    }

    await doctor.save();

    res.json({ success: true, schedule: doctor.schedule });
  } catch (err) {
    console.error("❌ ADD SCHEDULE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
