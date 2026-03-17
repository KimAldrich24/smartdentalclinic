import express from "express";
import {
  addReview,
  getReviews,
  approveReview,
  deleteReview,
  getAllReviewsAdmin,
} from "../controllers/reviewController.js";
import authUser from "../middleware/authUser.js";
import authAdmin from "../middleware/authAdmin.js";

const router = express.Router();

// patient
router.post("/add", authUser, addReview);

// public
router.get("/", getReviews);

// admin
router.get("/admin", authAdmin, getAllReviewsAdmin);
router.put("/approve/:id", authAdmin, approveReview);
router.delete("/:id", authAdmin, deleteReview);


export default router;