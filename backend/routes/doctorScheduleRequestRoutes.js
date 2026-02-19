import express from "express";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import {
  requestSchedule,
  getScheduleRequests,
} from "../controllers/doctorScheduleRequestController.js";

const router = express.Router();

// Doctor pushes schedule
router.post("/request", doctorAuthMiddleware, requestSchedule);

// Admin views pushed schedules
router.get("/", adminAuthMiddleware, getScheduleRequests);

export default router;
