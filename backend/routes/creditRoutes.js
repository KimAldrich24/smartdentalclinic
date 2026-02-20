// backend/routes/creditRoutes.js
import express from "express";
import { getAllCredits, getCreditByUser, updateCredit, getMyCredit, } from "../controllers/creditController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all credits (admin)
router.get("/", verifyAdmin, getAllCredits);
router.get("/my", verifyToken, getMyCredit); // 👈 NEW

// GET single patient credit
router.get("/:userId", verifyAdmin, getCreditByUser);

// POST update/deduct credit
router.post("/update", verifyAdmin, updateCredit);

export default router;
