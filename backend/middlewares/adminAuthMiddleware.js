import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";

const adminAuthMiddleware = async (req, res, next) => {
  try {
    console.log("🔐 adminAuthMiddleware - Checking authorization...");

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token provided");
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Token decoded:", decoded);

    // Check for admin/staff first
    let admin = await User.findById(decoded.id);

    // If not admin/staff, try doctor (optional, you can skip if doctors never access admin routes)
    if (!admin) {
      const doctor = await Doctor.findById(decoded.id);
      if (doctor) {
        console.log("❌ Access denied - doctors cannot access admin routes");
        return res.status(403).json({ success: false, message: "Access denied - admin/staff only" });
      }
    }

    if (!admin || !["admin", "staff"].includes(admin.role)) {
      console.log("❌ Access denied - not admin/staff or user not found");
      return res.status(403).json({ success: false, message: "Access denied - admin/staff only" });
    }

    req.admin = admin;
    console.log("✅ Admin auth passed, admin:", req.admin);
    next();
  } catch (err) {
    console.error("❌ adminAuthMiddleware error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminAuthMiddleware;