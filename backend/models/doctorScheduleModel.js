import mongoose from "mongoose";

const doctorScheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  day: { type: String, enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], required: true },
  startTime: { type: String, required: true }, // format: "09:00"
  endTime: { type: String, required: true },   // format: "17:00"
});

const DoctorSchedule = mongoose.models.DoctorSchedule || mongoose.model("DoctorSchedule", doctorScheduleSchema);

export default DoctorSchedule;
