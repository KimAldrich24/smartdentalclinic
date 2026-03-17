import express from "express";
import {
  addReview,
  getReviews,
  approveReview,
  deleteReview,
  getAllReviewsAdmin,
} from "../controllers/reviewController.js";
import protect from "../middlewares/authMiddleware.js";


const router = express.Router();

// patient
router.post("/add", protect(["user", "patient"]), addReview);

// public
router.get("/", getReviews);

// admin
router.get("/admin", protect(["admin"]), getAllReviewsAdmin);
router.put("/approve/:id", protect(["admin"]), approveReview);
router.delete("/:id", protect(["admin"]), deleteReview);


export default router;