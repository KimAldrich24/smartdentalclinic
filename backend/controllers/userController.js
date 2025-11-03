import axios from "axios";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Doctor from "../models/doctorModel.js";
import OTP from "../models/otpModel.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// In-memory OTP storage (use Redis in production)
const otpStorage = new Map();

// 🔐 Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ✉️ Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send Phone OTP
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Clean phone number
    let formattedPhone = phone.replace(/\D/g, "");

    // Validate format
    if (formattedPhone.startsWith("09") && formattedPhone.length === 11) {
      console.log("[DEBUG] Local phone:", formattedPhone);
    } else if (formattedPhone.startsWith("639") && formattedPhone.length === 12) {
      formattedPhone = "0" + formattedPhone.slice(2);
      console.log("[DEBUG] Converted 63→09:", formattedPhone);
    } else {
      console.log("[DEBUG] Invalid format:", formattedPhone);
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 11-digit number starting with 09",
      });
    }

    const token = process.env.IPROGTECH_API_KEY;
    if (!token) throw new Error("Missing IPROGTECH_API_KEY in .env");

    // Generate OTP
    const otpCode = generateOTP();

    // Store OTP with 5-minute expiration
    otpStorage.set(formattedPhone, {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });

    console.log("[DEBUG] Generated OTP:", otpCode, "for phone:", formattedPhone);

    // Prepare message
    const message = `Your Smart Dental verification code is ${otpCode}. It is valid for 5 minutes.`;

    // Convert to international format for sending
    let sendPhone = formattedPhone.startsWith("0")
      ? "63" + formattedPhone.slice(1)
      : formattedPhone;

    const body = {
      api_token: token,
      phone_number: sendPhone,
      message,
    };

    console.log("[DEBUG] Sending SMS to iProgTech:", { phone_number: sendPhone });

    // Use standard SMS endpoint
    const response = await axios.post(
      "https://sms.iprogtech.com/api/v1/sms_messages",
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("[DEBUG] iProgTech response:", response.data);

    if (response.data.status === 200) {
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        data: { phone_number: formattedPhone }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }
  } catch (err) {
    console.error("[ERROR] sendOtp:", err.response?.data || err.message || err);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || err.message || "Server error",
    });
  }
};

// ✅ Send Email OTP
export const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Generate OTP
    const otpCode = generateOTP();

    // Store OTP with 5-minute expiration
    otpStorage.set(email, {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });

    console.log("[DEBUG] Generated email OTP:", otpCode, "for email:", email);

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Smart Dental - Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Smart Dental Clinic</h2>
          <p>Your email verification code is:</p>
          <h1 style="background-color: #eff6ff; padding: 20px; text-align: center; letter-spacing: 8px; color: #3b82f6;">${otpCode}</h1>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("[DEBUG] Email OTP sent successfully to:", email);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email successfully"
    });

  } catch (err) {
    console.error("[ERROR] sendEmailOtp:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to send email OTP",
      error: err.message
    });
  }
};

// ✅ Verify Both OTPs and Register
export const verifyAndRegister = async (req, res) => {
  try { 
    const { name, email, password, phone, dob, phoneOtp } = req.body;

    console.log("[DEBUG] verifyAndRegister received:", { name, email, phone, phoneOtp, dob });

    // ✅ IMPROVED ERROR MESSAGE - SHOWS WHICH FIELDS ARE MISSING
    const missingFields = [];
    if (!phone) missingFields.push('phone');
    if (!phoneOtp) missingFields.push('phoneOtp');
    if (!password) missingFields.push('password');
    if (!email) missingFields.push('email');
    if (!name) missingFields.push('name');
    if (!dob) missingFields.push('dob');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Normalize phone
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("639") && formattedPhone.length === 12) {
      formattedPhone = "0" + formattedPhone.slice(2);
    }

    // === VERIFY PHONE OTP ONLY ===
    if (!otpStorage.has(formattedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone OTP not found or expired. Please request a new one.",
      });
    }

    const phoneStored = otpStorage.get(formattedPhone);

    if (Date.now() > phoneStored.expiresAt) {
      otpStorage.delete(formattedPhone);
      return res.status(400).json({
        success: false,
        message: "Phone OTP has expired. Please request a new one.",
      });
    }

    if (phoneStored.attempts >= 3) {
      otpStorage.delete(formattedPhone);
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    if (phoneStored.code !== phoneOtp.trim()) {
      phoneStored.attempts++;
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please try again.",
      });
    }

    // Phone OTP verified - remove from storage
    otpStorage.delete(formattedPhone);
    console.log("[DEBUG] Phone OTP verified successfully");

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: formattedPhone,
      dob: new Date(dob),
      role: "patient",
      status: "active",
    });

    console.log("[DEBUG] User created successfully:", newUser._id, "with DOB:", newUser.dob);

    // Generate token for auto-login
    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        dob: newUser.dob,
      },
    });
  } catch (err) {
    console.error("[ERROR] verifyAndRegister:", err.message);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: err.message,
    });
  }
};
// ✅ Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    if (user.status === "pending") {
      return res
        .status(403)
        .json({ success: false, message: "Your account is pending approval." });
    }
    if (user.status === "rejected") {
      return res
        .status(403)
        .json({ success: false, message: "Your account was rejected." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        gender: user.gender,
        dob: user.dob,
        phone: user.phone,
        address: user.address,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        image: req.user.image,
        gender: req.user.gender,
        dob: req.user.dob,
        phone: req.user.phone,
        address: req.user.address,
        role: req.user.role,
        status: req.user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Profile
export const updateUserProfile = async (req, res) => {
  try {
    console.log("➡️ Updating user:", req.user._id);
    console.log("➡️ Payload received:", req.body);
    let user = await User.findById(req.user._id);
    let userType = "user";

    if (!user) {
      user = await Doctor.findById(req.user._id);
      userType = "doctor";
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.gender !== undefined) user.gender = req.body.gender;
    if (req.body.dob !== undefined) user.dob = new Date(req.body.dob);
    if (req.body.image !== undefined) user.image = req.body.image;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: `${userType} profile updated successfully`,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.remove();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// ✅ Get Pending Users
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" });
    res.status(200).json({ success: true, users: pendingUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Approve User
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "active";
    await user.save();
    res.status(200).json({ success: true, message: "User approved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Reject User
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "rejected";
    await user.save();
    res.status(200).json({ success: true, message: "User rejected successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};