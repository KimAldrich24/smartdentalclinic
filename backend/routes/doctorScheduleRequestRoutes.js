import express from "express";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import {
  pushScheduleRequest,
  getAllScheduleRequests,
  getDoctorSchedules,
} from "../controllers/doctorScheduleRequestController.js";

const router = express.Router();

// Doctor pushes schedule request
router.post("/", doctorAuthMiddleware, pushScheduleRequest);

// Admin fetches all doctor schedule requests
router.get("/", adminAuthMiddleware, getAllScheduleRequests);

// Doctor fetches their own schedule requests
router.get("/doctor", async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const schedules = await getDoctorSchedules(doctorId);
    res.json({ success: true, requests: schedules }); // <-- important for frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch schedules" });
  }
});

export default router;
