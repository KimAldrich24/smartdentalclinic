import express from 'express';
import {
  submitPaymentProof,
  getAllPaymentProofs,
  getPaymentProofByAppointment,
  approvePaymentProof,
  rejectPaymentProof
} from '../controllers/paymentProofController.js';
import { uploadPaymentProof } from '../config/multer.js';

const router = express.Router();

// Patient routes (NO AUTH FOR NOW)
router.post('/submit', uploadPaymentProof.single('screenshot'), submitPaymentProof);
router.get('/appointment/:appointmentId', getPaymentProofByAppointment);

// Admin routes (NO AUTH FOR NOW)
router.get('/all', getAllPaymentProofs);
router.patch('/approve/:proofId', approvePaymentProof);
router.patch('/reject/:proofId', rejectPaymentProof);

export default router;