import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  serviceIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
  ], // <-- add this
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Fix OverwriteModelError
export default mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);