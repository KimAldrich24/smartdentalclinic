// backend/routes/dashboardRoutes.js
import express from "express";
import { getDashboardStats, getRecentAppointments } from "../controllers/dashboardController.js";
import { getCredits } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/recent-appointments", getRecentAppointments);
// GET /dashboard/credits
router.get("/credits", getCredits);

export default router;
