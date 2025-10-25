import express from "express";
import { authMiddleware, protect } from "../middlewares/authMiddleware.js";
import { addSchedule, getDoctorSchedule } from "../controllers/adminScheduleController.js";

const router = express.Router();

// Admin-only routes
router.post("/add-schedule", authMiddleware, protect(["admin"]), addSchedule);
router.get("/doctor-schedule/:doctorId", authMiddleware, protect(["admin"]), getDoctorSchedule);

export default router;
