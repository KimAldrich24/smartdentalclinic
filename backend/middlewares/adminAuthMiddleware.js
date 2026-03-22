import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // ✅ your admin is here

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

    // Fetch admin/staff from User collection
    const admin = await User.findById(decoded.id);
    if (!admin || !["admin", "staff"].includes(admin.role)) {
      console.log("❌ Access denied - not admin/staff or user not found");
      return res.status(403).json({ success: false, message: "Access denied - admin/staff only" });
    }

    // Attach the full admin object to request
    req.admin = admin;
    console.log("✅ Admin auth passed, admin:", req.admin);
    next();
  } catch (err) {
    console.error("❌ adminAuthMiddleware error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminAuthMiddleware;