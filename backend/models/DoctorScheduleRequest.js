// models/DoctorScheduleRequest.js
import mongoose from "mongoose";

const doctorScheduleRequestSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true },
  slots: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("DoctorScheduleRequest", doctorScheduleRequestSchema);
