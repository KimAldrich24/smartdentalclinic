import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // store hashed password
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["staff", "admin", "doctor"], // allow for role flexibility in unified login
      default: "staff",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite during hot reload (important for dev)
const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

export default Staff;
