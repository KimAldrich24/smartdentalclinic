import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ----------------- Address Schema -----------------
const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  { _id: false } // keep _id false here, it's fine
);

// ----------------- Schedule Schema -----------------
const scheduleSchema = new mongoose.Schema({
  date: { type: String, required: true }, // "2025-10-24"
  slots: [{ type: String }], // ["09:00 AM", "10:00 AM"]
});
// ✅ Removed { _id: false } so each schedule has its own _id

// ----------------- Doctor Schema -----------------
const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    degree: String,
    experience: { type: Number, min: 0, max: 50 },
    about: String,
    address: { type: addressSchema, default: () => ({}) },
    image: String,
    available: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },

    // Services that this doctor offers
    services: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },
      ],
      default: [],
    },

    // Doctor's schedule (available time slots per date)
    schedule: {
      type: [scheduleSchema],
      default: [], // initialize empty array
    },

    // Booked slots (to prevent double booking)
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

// ----------------- Hash password before saving -----------------
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ----------------- Match password method -----------------
doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ----------------- Export Model -----------------
const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
export default Doctor;
