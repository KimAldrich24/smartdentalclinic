import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  { _id: false }
);

// ✅ Schema for doctor schedules
const slotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // e.g. "2025-10-15"
    availableSlots: [{ type: String }],     // e.g. ["09:00 AM", "10:30 AM"]
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  degree: String,
  experience: String,
  about: String,
  fees: Number,
  address: { type: addressSchema, default: () => ({}) },
  image: String,
  available: { type: Boolean, default: true },
  date: { type: Date, default: Date.now },

  // ✅ Doctors’ booked slots (used to track which times are unavailable)
  slots_book: {
    type: Map,
    of: [String],
    default: {},
  },

  // ✅ Doctors’ available schedules (for patients to book)
  slots_available: [slotSchema],
});

// ✅ Hash password before saving
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare entered password to stored hash
doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
export default Doctor;
