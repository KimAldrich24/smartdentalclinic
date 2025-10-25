import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Doctor from "../models/doctorModel.js"; // ✅ Add this import

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
// ✅ Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ New users (patients) are auto-approved
const newUser = await User.create({
  name,
  email,
  password: hashedPassword,
  role: "patient", // ✅ Explicitly set role
  status: "active", // ✅ Auto-approve patients (was "pending")
}); 

    res.status(201).json({
      success: true,
      message: "Account created. Waiting for admin approval.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        status: newUser.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // ✅ Block login if pending or rejected
    if (user.status === "pending") {
      return res.status(403).json({ success: false, message: "Your account is pending approval." });
    }
    if (user.status === "rejected") {
      return res.status(403).json({ success: false, message: "Your account was rejected." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // Generate token
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

// ✅ Get current user profile
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

// ✅ Update user profile (works for both users and doctors)
export const updateUserProfile = async (req, res) => {
  try {
    // Try finding in User collection
    let user = await User.findById(req.user.id);
    let userType = "user";

    // If not found, try Doctor
    if (!user) {
      user = await Doctor.findById(req.user.id);
      userType = "doctor";
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields safely
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;
    user.dob = req.body.dob || user.dob;
    user.address = req.body.address || user.address;
    user.image = req.body.image || user.image;

    await user.save();

    res.status(200).json({
      success: true,
      message: `${userType} profile updated successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        gender: user.gender,
        dob: user.dob,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete user
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

// ✅ Get all pending users
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" });
    res.status(200).json({ success: true, users: pendingUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Approve user
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "active"; // now they can log in
    await user.save();
    res.status(200).json({ success: true, message: "User approved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Reject user
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
