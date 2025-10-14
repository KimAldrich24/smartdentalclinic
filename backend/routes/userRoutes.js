import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getAllUsers,deleteUser} from "../controllers/userController.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, updateUserProfile); // ✅ added
router.get("/", adminAuthMiddleware, getAllUsers);
router.delete("/:id", adminAuthMiddleware, deleteUser);


export default router;
