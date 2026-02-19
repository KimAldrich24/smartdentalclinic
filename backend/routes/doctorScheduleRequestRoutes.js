import express from "express";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import {
  pushScheduleRequest,
  getAllScheduleRequests,
  getDoctorSchedules,
} from "../controllers/doctorScheduleRequestController.js";

const router = express.Router();

/**
 * Doctor pushes schedule request
 * POST /api/doctor/schedule-request
 */
router.post(
  "/",
  doctorAuthMiddleware,
  pushScheduleRequest
);

/**
 * Admin fetches all doctor schedule requests
 * GET /api/admin/schedule-requests
 */
router.get(
  "/",
  adminAuthMiddleware,
  getAllScheduleRequests
);

/**
 * Doctor fetches their own schedule requests
 * GET /api/schedule-requests/doctor
 */
router.get(
  "/doctor",
  doctorAuthMiddleware,
  async (req, res) => {
    try {
      const doctorId = req.doctor._id; // set by doctorAuthMiddleware
      const schedules = await getDoctorSchedules(doctorId); // call your controller
      res.json({ success: true, schedules });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
    }
  }
);

export default router;
