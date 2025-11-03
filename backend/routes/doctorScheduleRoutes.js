import express from "express";
import DoctorSchedule from "../models/doctorScheduleModel.js";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";

const router = express.Router();

/* =========================
   🔹 CREATE a new schedule
========================= */
router.post("/", doctorAuthMiddleware, async (req, res) => {
  try {
    const { date, slots } = req.body;
    const doctorId = req.doctorId;

    console.log("📝 Saving schedule:", { doctorId, date, slots });

    // Check if schedule exists
    const existing = await DoctorSchedule.findOne({ doctorId, date });
    if (existing) {
      // Update existing schedule
      existing.slots = slots;
      await existing.save();
      console.log("✅ Schedule updated");
      return res.json({ success: true, schedule: existing });
    }

    // Create new schedule
    const schedule = new DoctorSchedule({ doctorId, date, slots });
    await schedule.save();
    console.log("✅ Schedule created");

    res.json({ success: true, schedule });
  } catch (error) {
    console.error("❌ Error saving schedule:", error);
    res.status(500).json({ success: false, message: "Error saving schedule" });
  }
});

/* =========================
   🔹 GET schedules (for logged-in doctor)
========================= */
router.get("/", doctorAuthMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctorId;
    console.log("🔍 Fetching schedules for doctor:", doctorId);
    
    const schedules = await DoctorSchedule.find({ doctorId }).sort({ date: 1 });
    console.log("📥 Found schedules:", schedules.length);
    
    res.json({ success: true, schedules });
  } catch (error) {
    console.error("❌ Error fetching schedules:", error);
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

export default router;