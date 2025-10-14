import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Doctor from "./models/doctorModel.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

const seedDoctor = async () => {
  await Doctor.deleteMany({}); // optional, clear previous

  const hashedPassword = await bcrypt.hash("123456", 10); // plain password here

  const doctor = {
    name: "Kim Aldrich",
    email: "correctemail@example.com", // fix this
    password: bcrypt.hashSync("yourpassword", 10),
  };
  

  await doctor.save();
  console.log("Doctor seeded!");
  mongoose.disconnect();
};

seedDoctor();
