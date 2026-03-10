import mongoose from "mongoose";

// Address sub-schema
const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  { _id: false }
);

// Child sub-schema
const childSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    // Optional: add notes, allergies, etc.
  },
  { _id: true }
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
    dob: { type: Date, default: null }, // for adult users
    phone: { type: String, default: " " },
    role: { type: String, enum: ["admin", "staff", "patient", "guardian"], default: "patient" },
    status: { type: String, enum: ["pending", "active", "rejected"], default: "active" },

    // ✅ Guardian-specific field
    children: { type: [childSchema], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;