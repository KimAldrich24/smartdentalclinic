import express from "express";
import { addDoctor, loginAdmin, getAllDoctors, removeDoctor } from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authMiddleware, { adminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/add-doctor", authMiddleware, adminMiddleware, upload.single("image"), addDoctor);
router.get("/all-doctors", authMiddleware, adminMiddleware, getAllDoctors);
router.delete("/remove-doctor/:id", authMiddleware, adminMiddleware, removeDoctor);

export default router;
