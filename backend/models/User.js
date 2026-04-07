import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
  },
  password: { type: String, required: true },
  phone: {
    type: String,
    default: "000000000",
    trim: true,
    validate: {
      validator: function (value) {
        return !value || /^09\d{9}$/.test(value);
      },
      message: 'Phone number must start with 09 and be exactly 11 digits.',
    },
  },
  dob: { type: String, default: "Not Selected" },
  gender: { type: String, default: "Not Selected" },
  image: String,
  address: Object,
}, { timestamps: true });

// Fix OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
