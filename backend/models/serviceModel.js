import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: String }, // e.g., "30 mins", "1 hour"
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Service", serviceSchema);
