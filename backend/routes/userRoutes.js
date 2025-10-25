import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  getPendingUsers,
  approveUser,
  rejectUser
} from "../controllers/userController.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Authenticated routes (all users)
router.get("/me", protect, getCurrentUser);
router.put("/me", protect(), updateUserProfile);

// Admin-only routes
router.get("/", adminAuthMiddleware, getAllUsers);
router.delete("/:id", adminAuthMiddleware, deleteUser);
router.get("/pending", adminAuthMiddleware, getPendingUsers);
router.put("/approve/:id", adminAuthMiddleware, approveUser);
router.put("/reject/:id", adminAuthMiddleware, rejectUser);

export default router;