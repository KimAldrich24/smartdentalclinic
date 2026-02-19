// routes/doctorScheduleRequestRoutes.js
import express from "express";
import { pushScheduleRequest, getAllScheduleRequests } from "../controllers/doctorScheduleRequestController.js";
import { verifyDoctor } from "../middlewares/doctorAuthMiddleware.js";
import { verifyAdmin } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Doctor pushes schedule
router.post("/request", verifyDoctor, pushScheduleRequest);

// Admin fetches all requests
router.get("/", verifyAdmin, getAllScheduleRequests);

export default router;
