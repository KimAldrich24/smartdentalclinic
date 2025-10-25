import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import Doctor from "../models/doctorModel.js";


// Add Doctor
export const addDoctor = async (req, res) => {
  try {
    const { name, email, password, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    // Validate required fields
    if (!name || !email || !password || !degree || !experience || !about || !fees || !address || !imageFile) {
      return res.status(400).json({ success: false, message: "Missing details or image" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password too short" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    const imageUrl = imageUpload.secure_url;

    let parsedAddress;
    try {
      parsedAddress = JSON.parse(address);
    } catch {
      parsedAddress = { line1: "", line2: "" };
    }

    const doctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      degree,
      experience,
      about,
      fees,
      address: parsedAddress,
      image: imageUrl,
      available: true,
      date: Date.now(),
    });

    await doctor.save();
    res.json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    console.error("AddDoctor Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Admin login (env-based)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: "admin-id", email, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.json({ success: true, token });
    }

    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all doctors
export const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove doctor
export const removeDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await doctorModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, message: "Doctor removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Account already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: `${role} account created successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
  
//  export const getAllDoctors = async () => {
//   if (!aToken || userRole !== "admin") return; // ✅ Guard

//   try {
//     const res = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
//       headers: { Authorization: `Bearer ${aToken}` },
//     });
//     setDoctors(res.data.doctors || []);
//   } catch (err) {
//     console.error("Get doctors error:", err);
//     if (err.response?.status === 401) {
//       setAToken(null);
//       setUserRole(null);
//       toast.error("Session expired. Please log in again.");
//     }
//     setDoctors([]);
//   }
// };

