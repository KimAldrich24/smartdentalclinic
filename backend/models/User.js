import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, default: "000000000" },
  dob: { type: String, default: "Not Selected" },
  gender: { type: String, default: "Not Selected" },
  image: String,
  address: Object,
}, { timestamps: true });

// Fix OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
