import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Staff from "./models/staffModel.js"; // adjust path if needed

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

const resetPassword = async () => {
  try {
    const email = "jameslacre@gmail.com"; // staff email to reset
    const newPassword = "staff123"; // new plaintext password

    const staff = await Staff.findOne({ email });
    if (!staff) {
      console.log("Staff not found");
      process.exit(0);
    }

    staff.password = await bcrypt.hash(newPassword, 10);
    await staff.save();

    console.log(`✅ Password for ${email} reset to '${newPassword}'`);
    process.exit(0);
  } catch (err) {
    console.error("Error resetting password:", err);
    process.exit(1);
  }
};

resetPassword();
