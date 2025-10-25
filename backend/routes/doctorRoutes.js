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
  addDoctorSchedule,
  getDoctorProfile,
  deleteDoctor,
  getAllServices,
  addDoctorService,
  removeDoctorService,
  getDoctorServicesAndSchedule,
} from '../controllers/doctorController.js';
import doctorAuthMiddleware from "../middlewares/doctorAuthMiddleware.js";
import adminAuth from "../middlewares/adminAuthMiddleware.js"; 

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

// 🔐 Get doctor profile (protected)
router.get("/me", doctorAuthMiddleware, getDoctorProfile);

// ✅ Get all services (for doctor to choose from)
router.get("/services/all", doctorAuthMiddleware, getAllServices);
// ✅ Doctor's services routes
router.post("/my-services", doctorAuthMiddleware, addDoctorService);
router.delete("/my-services/:serviceId", doctorAuthMiddleware, removeDoctorService);
// ✅ Schedule routes (doctor only)
router.post("/schedule", doctorAuthMiddleware, addDoctorSchedule);
router.get("/my-data", doctorAuthMiddleware, getDoctorServicesAndSchedule);
// Existing routes
router.post("/", upload.single("docImg"), addDoctor);
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.get("/:id/slots", getDoctorSlots);
router.post("/:id/book", bookDoctorSlot);


router.delete("/:id", adminAuth, deleteDoctor);


export default router;
