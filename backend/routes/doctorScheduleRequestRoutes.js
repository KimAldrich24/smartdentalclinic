import express from "express";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import {
  pushScheduleRequest,
  getAllScheduleRequests,
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

export default router;
