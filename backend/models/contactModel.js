import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    active: { type: Boolean, default: true }, // ✅ add this
    businessHours: { type: String, default: "" }, // ✅ Add this line
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
