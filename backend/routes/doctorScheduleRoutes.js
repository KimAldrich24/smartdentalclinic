import express from "express";
import DoctorSchedule from "../models/doctorScheduleModel.js";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";

const router = express.Router();

/* =========================
   🔹 CREATE a new schedule
========================= */
router.post("/", doctorAuthMiddleware, async (req, res) => {
  try {
    const { date, timeSlots } = req.body;
    const doctorId = req.doctorId;

    const existing = await DoctorSchedule.findOne({ doctorId, date });
    if (existing) {
      return res.json({ success: false, message: "Schedule already exists for this date" });
    }

    const schedule = new DoctorSchedule({ doctorId, date, timeSlots });
    await schedule.save();

    res.json({ success: true, schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error saving schedule" });
  }
});

/* =========================
   🔹 GET schedules (for logged-in doctor)
========================= */
router.get("/", doctorAuthMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctorId;
    const schedules = await DoctorSchedule.find({ doctorId }).sort({ date: 1 });
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching schedules" });
  }
});

/* =========================
   🔹 DELETE a schedule
========================= */
router.delete("/:id", doctorAuthMiddleware, async (req, res) => {
  try {
    await DoctorSchedule.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting schedule" });
  }
});

/* =========================
   🔹 PUBLIC — get all available schedules (for patients)
========================= */
router.get("/available", async (req, res) => {
    try {
      const schedules = await DoctorSchedule.find()
        .populate("doctorId", "name degree image")
        .sort({ date: 1 });
      res.json({ success: true, schedules });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching available schedules" });
    }
  });
  
  /* =========================
     🔹 PATIENT BOOKING — mark slot as booked
  ========================= */
  router.post("/:id/book", async (req, res) => {
    try {
      const { slotIndex, patientName } = req.body;
      const schedule = await DoctorSchedule.findById(req.params.id);
      if (!schedule) return res.json({ success: false, message: "Schedule not found" });
  
      if (schedule.timeSlots[slotIndex].booked)
        return res.json({ success: false, message: "Slot already booked" });
  
      schedule.timeSlots[slotIndex].booked = true;
      await schedule.save();
  
      // Optionally: create an Appointment model here later
      res.json({ success: true, message: `Slot booked for ${patientName}` });
    } catch (error) {
      res.status(500).json({ success: false, message: "Booking failed" });
    }
  });


export default router;
