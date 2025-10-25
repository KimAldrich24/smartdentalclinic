import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  { _id: false }
);

// ✅ Available time slots for each date
const scheduleSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "2025-10-24"
    slots: [{ type: String }], // ["09:00 AM", "10:00 AM", "02:00 PM"]
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    degree: String,
    experience: String,
    about: String,
    fees: Number,
    address: { type: addressSchema, default: () => ({}) },
    image: String,
    available: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },

    // ✅ Services that this doctor offers (references to Service model)
    services: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      }],
      default: [] // ✅ Initialize as empty array
    },

    // ✅ Doctor's schedule (available time slots per date)
    schedule: {
      type: [scheduleSchema],
      default: [] // ✅ Initialize as empty array
    },

    // ✅ Booked slots (for tracking unavailable times)
    slots_book: {
      type: Map,
      of: [String],
      default: {},
    },

    role: {
      type: String,
      enum: ["doctor", "staff", "admin"],
      default: "doctor",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

export default Doctor;