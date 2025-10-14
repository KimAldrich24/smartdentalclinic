import Doctor from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key"; // make sure to add to .env
// 🔹 Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Doctor Register (optional — if you want doctors to sign up themselves)
export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, degree, experience } = req.body;

    const existing = await Doctor.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      degree,
      experience,
    });

    res.status(201).json({ success: true, message: "Doctor registered", doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Doctor Login
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor)
      return res.status(404).json({ success: false, message: "Doctor not found" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid password" });

    const token = generateToken(doctor._id);
    res.json({
      success: true,
      token,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        degree: doctor.degree,
        speciality: doctor.speciality,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ✅ Get logged-in doctor profile
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor._id).select("-password");
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


const doctorAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findById(decoded.id).select('-password');
    if (!doctor) return res.status(401).json({ success: false, message: 'Unauthorized: Doctor not found' });
    req.doctor = doctor;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

export default doctorAuthMiddleware;