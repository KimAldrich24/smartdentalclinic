import mongoose from 'mongoose';

const paymentProofSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or 'Patient' depending on your user model name
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  referenceNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  screenshot: {
    type: String, // URL or filename of uploaded screenshot
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  rejectionReason: String
}, { timestamps: true });

const PaymentProof = mongoose.model('PaymentProof', paymentProofSchema);

export default PaymentProof;