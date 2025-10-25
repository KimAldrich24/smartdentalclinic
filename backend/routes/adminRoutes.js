import express from "express";
import { addDoctor, loginAdmin, allDoctors, removeDoctor } from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import { getAllPrescriptions } from "../controllers/prescriptionController.js";

const router = express.Router();

router.post("/login", loginAdmin);

// Only admin can access these routes
router.post("/add-doctor", adminAuthMiddleware, upload.single("image"), addDoctor);
router.get("/all-doctors", adminAuthMiddleware, allDoctors);
router.delete("/remove-doctor/:id", adminAuthMiddleware, removeDoctor);
router.get("/prescriptions", getAllPrescriptions);

export default router;