import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // ❗ Service is assigned later by doctor
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    default: null
  },

  date: {
    type: String,
    required: true
  },

  time: {
    type: String,
    required: true
  },

  // ✅ New status flow
  status: {
    type: String,
    enum: [
      "PENDING_ADMIN",
      "APPROVED_ADMIN",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED"
    ],
    default: "PENDING_ADMIN"
  },

  // 💰 Pricing (filled later)
  finalPrice: {
    type: Number,
    default: 0
  },

  additionalPayment: {
    type: Number,
    default: 0
  },

  additionalPaymentNote: {
    type: String
  },

  totalPrice: {
    type: Number,
    default: 0
  },

  // 💳 Payment tracking
  paymentStatus: {
    type: String,
    enum: ["pending", "paid_cash", "paid_online"],
    default: "pending"
  },

  paymentProofId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentProof",
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

// ✅ Safe total price calculation
appointmentSchema.pre("save", function (next) {
  this.totalPrice = (this.finalPrice || 0) + (this.additionalPayment || 0);
  next();
});

export default mongoose.model("Appointment", appointmentSchema);
