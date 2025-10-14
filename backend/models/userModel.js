import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: {
    type: String,
    default: "data:image/png;base64,...",
  },
  address: { type: addressSchema, default: () => ({}) },
  gender: { type: String, default: "Not Selected" },
  dob: { type: String, default: "Not Selected" },
  phone: { type: String, default: "000000000" },
  role: { type: String, enum: ["admin", "staff"], default: "staff" },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
