import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientName: { type: String, required: true },
    serviceName: { type: String, required: true },
    dentistName: { type: String },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Cash", "Card", "GCash"], default: "Cash" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model("Sale", salesSchema);
