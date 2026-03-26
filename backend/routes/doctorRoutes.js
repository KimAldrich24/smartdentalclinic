import express from 'express';
import multer from 'multer';
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
  changeDoctorPassword,
  editDoctorSchedule,
  deleteDoctorSchedule,
  getDoctorSchedule
} from '../controllers/doctorController.js';
import doctorAuthMiddleware from '../middlewares/doctorAuthMiddleware.js';
import adminAuth from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/doctors/'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });


// ─────────────────────────────────────────────
//  1.  STATIC routes — must come before /:id
// ─────────────────────────────────────────────

// Auth
router.post('/login',           doctorLogin);
router.put('/change-password',  doctorAuthMiddleware, changeDoctorPassword); // ⬅ fixed (was after /:id)

// Profile & data
router.get('/me',               doctorAuthMiddleware, getDoctorProfile);
router.get('/my-data',          doctorAuthMiddleware, getDoctorServicesAndSchedule);

// Services
router.get('/services/all',     doctorAuthMiddleware, getAllServices);
router.post('/my-services',     doctorAuthMiddleware, addDoctorService);
router.delete('/my-services/:serviceId', doctorAuthMiddleware, removeDoctorService);

// Schedule — static segment first, then :date param
router.post('/schedule',        doctorAuthMiddleware, addDoctorSchedule);
router.get('/schedule',          doctorAuthMiddleware, getDoctorSchedule);
router.put('/schedule/:date',   doctorAuthMiddleware, editDoctorSchedule);
router.delete('/schedule/:date', doctorAuthMiddleware, deleteDoctorSchedule);

// Admin: add doctor
router.post('/', upload.single('docImg'), addDoctor);
router.get('/',  getAllDoctors);


router.get('/:id',        getDoctorById);
router.get('/:id/slots',  getDoctorSlots);
router.post('/:id/book',  bookDoctorSlot);
router.delete('/:id',     adminAuth, deleteDoctor);


export default router;