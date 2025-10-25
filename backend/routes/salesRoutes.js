import express from "express";
import { getSalesReport } from "../controllers/salesController.js";
import protect from "../middlewares/authMiddleware.js"; // ✅ CORRECT


const router = express.Router();

router.get("/report", protect, getSalesReport);

export default router;
