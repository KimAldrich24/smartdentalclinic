import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ----------------- Address Schema -----------------
const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  { _id: false }
);

// ----------------- Slot Schema -----------------
const slotSchema = new mongoose.Schema(
  {
    time: { type: String, required: true }, // "10:00"
    status: {
      type: String,
      enum: ["available", "booked", "finished"],
      default: "available",
    },
  },
  { _id: false }
);

// ----------------- Schedule Schema -----------------
const scheduleSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "2026-02-06"
    slots: { type: [slotSchema], default: [] },
  },
  { _id: true }
);

// ----------------- Doctor Schema -----------------
const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    degree: String,
    experience: { type: Number, min: 0, max: 50 },
    about: String,
    address: { type: addressSchema, default: () => ({}) },
    image: String,

    available: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },

    // Services offered
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    // ✅ FIXED schedule structure
    schedule: {
      type: [scheduleSchema],
      default: [],
    },

    // Booked slots (legacy support)
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
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// ----------------- Hash password -----------------
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ----------------- Match password -----------------
doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ----------------- Export Model -----------------
const Doctor =
  mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

export default Doctor;
