import mongoose from "mongoose";

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true }, // "2024-11-02"
  slots: [{ type: String, required: true }], // ["09:00", "10:00", "11:00"]
}, { timestamps: true });

const DoctorSchedule = mongoose.models.DoctorSchedule || mongoose.model("DoctorSchedule", doctorScheduleSchema);

export default DoctorSchedule;