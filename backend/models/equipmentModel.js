import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, // e.g., Dental, Sterilization, X-Ray
  serialNumber: { type: String, unique: true },
  location: { type: String }, // e.g., Room 1
  status: { type: String, default: "Available" }, // Available, In Use, Under Maintenance, Broken
  lastMaintenance: { type: Date },
  nextMaintenance: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Equipment", equipmentSchema);
