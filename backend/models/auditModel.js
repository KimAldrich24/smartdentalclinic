import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String },
  action: { type: String, required: true },
  module: { type: String },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("AuditTrail", auditSchema);
