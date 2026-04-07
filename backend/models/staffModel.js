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
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: true, // store hashed password
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return /^09\d{9}$/.test(value);
        },
        message: 'Phone number must start with 09 and be exactly 11 digits.',
      },
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
