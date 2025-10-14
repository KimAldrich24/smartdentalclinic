// routes/promotionRoutes.js
import express from "express";
import { addPromotion, getAllPromotions, updatePromotion, deletePromotion } from "../controllers/promotionController.js";

const router = express.Router();

router.post("/", addPromotion);           // Add new promotion
router.get("/", getAllPromotions);        // Get all promotions
router.put("/:id", updatePromotion);      // Update promotion
router.delete("/:id", deletePromotion);   // Delete promotion

export default router;
