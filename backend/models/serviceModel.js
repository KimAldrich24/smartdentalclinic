import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  duration: { type: String }, // e.g., "30 mins", "1 hour"
  date: { type: Date, default: Date.now },
  price: { type: Number, required: true, min: 0 }
});

export default mongoose.model("Service", serviceSchema);
