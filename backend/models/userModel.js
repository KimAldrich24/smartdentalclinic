import mongoose from "mongoose";

// Address sub-schema
const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  { _id: false }
);

// Main User schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: {
      type: String,
      default: "data:image/png;base64,...", // default avatar
    },
    address: { type: addressSchema, default: () => ({}) },
    gender: { type: String, default: "Not Selected" },
    dob: { type: Date, default: null }, // ✅ FIXED: Allow null for admins
    phone: { type: String, default: " " },
    role: { type: String, enum: ["admin", "staff", "patient"], default: "patient" },
    status: { type: String, enum: ["pending", "active", "rejected"], default: "active" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;