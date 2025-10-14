import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    position: String,
    message: String,
    resumePath: String,
  },
  { timestamps: true }
);

export default mongoose.model("JobApplication", jobApplicationSchema);
