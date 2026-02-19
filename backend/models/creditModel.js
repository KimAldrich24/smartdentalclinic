// backend/models/creditModel.js
import mongoose from "mongoose";

const creditSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // one credit record per patient
  },
  amount: {
    type: Number,
    default: 0,
  },
  history: [
    {
      appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
      change: Number, // positive for earned, negative for deducted
      note: String,
      date: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

export default mongoose.model("Credit", creditSchema);
