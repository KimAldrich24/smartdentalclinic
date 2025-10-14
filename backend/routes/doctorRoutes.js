import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  addDoctor,
  getAllDoctors,
  getDoctorById,
  getDoctorSlots,
  bookDoctorSlot,
  doctorLogin,
  addDoctorSchedule
} from '../controllers/doctorController.js';
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/doctors/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// 🔐 Doctor Login
router.post("/login", doctorLogin);

// 🗓️ Add Schedule (Doctor only)
router.post("/schedule", doctorAuthMiddleware, addDoctorSchedule);

// Existing routes
router.post("/", upload.single("docImg"), addDoctor);
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.get("/:id/slots", getDoctorSlots);
router.post("/:id/book", bookDoctorSlot);

export default router;
