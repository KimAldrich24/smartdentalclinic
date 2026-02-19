import mongoose from "mongoose";

const creditSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, default: 0 },
  history: [
    {
      appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
      change: { type: Number },
      note: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

export default mongoose.model("Credit", creditSchema);
