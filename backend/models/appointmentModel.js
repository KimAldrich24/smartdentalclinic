import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["booked", "completed", "cancelled"], default: "booked" },
  
  // ✅ Payment fields
  finalPrice: { type: Number, required: true },
  additionalPayment: { type: Number, default: 0 },
  additionalPaymentNote: { type: String },
  totalPrice: { type: Number },
  
  // ✅ NEW: Payment status and proof tracking
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid_cash', 'paid_online'],
    default: 'pending'
  },
  paymentProofId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentProof'
  },
  
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

// Calculate total price before saving
appointmentSchema.pre('save', function(next) {
  this.totalPrice = this.finalPrice + (this.additionalPayment || 0);
  next();
});

export default mongoose.model("Appointment", appointmentSchema);