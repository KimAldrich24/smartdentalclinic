import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional if patients register themselves
  phone: { type: String, default: "Not Set" },
  dob: { type: String, default: "Not Selected" },
  gender: { type: String, default: "Not Selected" },
  address: { type: Object, default: {} },
  image: { type: String, default: "" }
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
