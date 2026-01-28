import express from "express";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";
import Doctor from "../models/doctorModel.js";

const router = express.Router();

/* =========================
   🔹 CREATE or UPDATE schedule
========================= */
router.post("/", doctorAuthMiddleware, async (req, res) => {
  try {
    const { date, slots } = req.body;
    const doctorId = req.doctorId;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const existing = doctor.schedule.find(s => s.date === date);

    if (existing) {
      existing.slots = slots;
    } else {
      doctor.schedule.push({ date, slots });
    }

    await doctor.save();

    res.json({ success: true, schedule: doctor.schedule });
  } catch (error) {
    console.error("❌ Save schedule error:", error);
    res.status(500).json({ success: false, message: "Error saving schedule" });
  }
});

/* =========================
   🔹 GET schedules (doctor)
========================= */
router.get("/", doctorAuthMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctorId).select("schedule");

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.json({
      success: true,
      schedules: doctor.schedule.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ),
    });
  } catch (error) {
    console.error("❌ Fetch schedules error:", error);
    res.status(500).json({ success: false, message: "Error fetching schedules" });
  }
});

/* =========================
   🔹 DELETE schedule
========================= */
router.delete("/:scheduleId", doctorAuthMiddleware, async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.doctorId,
      { $pull: { schedule: { _id: scheduleId } } },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("❌ Delete schedule error:", error);
    res.status(500).json({ success: false, message: "Failed to delete schedule" });
  }
});

/* =========================
   🔹 PUBLIC — available schedules (patients)
========================= */
router.get("/available", async (req, res) => {
  try {
    const doctors = await Doctor.find(
      { "schedule.0": { $exists: true } },
      "name degree image schedule"
    );

    const schedules = doctors.flatMap(doc =>
      doc.schedule.map(s => ({
        _id: s._id,
        date: s.date,
        slots: s.slots,
        doctor: {
          _id: doc._id,
          name: doc.name,
          degree: doc.degree,
          image: doc.image,
        },
      }))
    );

    res.json({ success: true, schedules });
  } catch (error) {
    console.error("❌ Fetch available schedules error:", error);
    res.status(500).json({ success: false, message: "Error fetching schedules" });
  }
});

export default router;
