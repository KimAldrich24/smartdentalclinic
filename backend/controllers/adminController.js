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
const { name, email, phone, password, degree, experience, about, fees, address } = req.body;
  const imageFile = req.file;

  // Validate required fields
  if (!name || !email || !password || !degree || !experience || !about || !fees || !address || !imageFile) {
    return res.status(400).json({ success: false, message: "Missing details or image" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid Email" });
  }

  if (phone && !/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "Contact number must start with 09 and be exactly 11 digits." });
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
      phone,
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

    const admin = await User.findOne({ email, role: "admin" });
    
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ✅ CREATE AUDIT LOG DIRECTLY - NO HELPER FUNCTION
    try {
      const AuditTrail = (await import("../models/auditModel.js")).default;
      await AuditTrail.create({
        userId: admin._id,
        role: "admin",
        action: "LOGIN",
        module: "AUTH",
        ipAddress: req.ip || "unknown",
      });
      console.log("✅ Audit log created for:", admin.email);
    } catch (auditErr) {
      console.error("⚠️ Audit log failed:", auditErr.message);
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token });
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

// ✅ Check if admin exists
export const checkAdminExists = async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    res.json({ exists: !!admin });
  } catch (error) {
    res.status(500).json({ exists: false, message: error.message });
  }
};

// ✅ Create first admin account (ONE-TIME REGISTRATION)
// ✅ Create first admin account (ONE-TIME REGISTRATION)
export const createAdmin = async (req, res) => {
  try {
     const { name, email, password, phone } = req.body;

     console.log("📝 Admin registration attempt:", { name, email, phone });
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    
    if (existingAdmin) {
      console.log("❌ Admin already exists");
      return res.status(403).json({
        success: false,
        message: "Admin account already exists. Registration is disabled.",
      });
    }

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (phone && !/^09\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must start with 09 and be exactly 11 digits.",
      });
    }

    // Check if email already in use
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create admin object
    const adminData = {
      name,
      email,
      password: hashedPassword,
      role: "admin",
      phone: phone || "000000000",
      gender: "Not Selected",
      address: { line1: "", line2: "" },
    };

    console.log("🔨 Creating admin with data:", JSON.stringify(adminData, null, 2)); // ✅ DEBUG

    const admin = new User(adminData);

    console.log("👤 Admin object BEFORE save:", JSON.stringify(admin.toObject(), null, 2)); // ✅ DEBUG

    await admin.save();

    console.log("✅ Admin created successfully:", admin.email);

    res.status(201).json({
      success: true,
      message: "Admin account created successfully! You can now log in.",
    });
  } catch (error) {
    console.error("❌ Create admin error:", error);
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

