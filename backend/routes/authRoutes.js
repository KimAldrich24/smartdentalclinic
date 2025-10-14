import express from "express";
import { login } from "../controllers/authController.js";
import { createAdmin } from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Login route (existing)
router.post("/login", login);

// Signup route (public for now — remove protect if anyone can sign up)
router.post("/signup", createAdmin);

// Admin-only create account
router.post("/create-admin", protect(["admin"]), createAdmin);

export default router;
