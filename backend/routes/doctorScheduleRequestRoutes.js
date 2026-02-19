// routes/doctorScheduleRequestRoutes.js
import express from "express";
import { pushScheduleRequest, getAllScheduleRequests } from "../controllers/doctorScheduleRequestController.js";
import { verifyDoctor } from "../middleware/doctorAuth.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Doctor pushes schedule
router.post("/request", verifyDoctor, pushScheduleRequest);

// Admin fetches all requests
router.get("/", verifyAdmin, getAllScheduleRequests);

export default router;
