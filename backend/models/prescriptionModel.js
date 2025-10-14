import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Link to patient's profile
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor", // Who wrote the prescription
    required: true,
  },
  medicines: [
    {
      name: String,
      dosage: String,
      instructions: String,
    }
  ],
  notes: String,
  dateIssued: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Prescription", prescriptionSchema);
