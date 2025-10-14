import express from "express";
import { loginDoctor, getDoctorProfile } from "../controllers/doctorAuthController.js";
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";

const router = express.Router();

// 🔹 Doctor Login
router.post("/login", loginDoctor);

// 🔹 Get logged-in doctor info
router.get("/me", doctorAuthMiddleware, getDoctorProfile);

export default router;
