import express from 'express';
import { addToothTreatment, getPatientTreatments } from '../controllers/toothController.js';
import doctorAuthMiddleware from '../middlewares/doctorAuthMiddleware.js';

const router = express.Router();

// Add treatment (doctor only)
router.post('/', doctorAuthMiddleware, addToothTreatment);

// Get patient treatments (both doctor and patient can view)
router.get('/patient/:patientId', getPatientTreatments);

export default router;