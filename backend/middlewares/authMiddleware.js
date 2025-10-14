import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";

/**
 * Protect routes — attach user to req.user
 */
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findById(decoded.id).select("-password");
    if (!user) {
      user = await Doctor.findById(decoded.id).select("-password");
    }

    // If no user is found
    if (!user) {
      // Special case: Admin login
      if (decoded.role === "admin") {
        req.user = {
          id: decoded.id || "admin-id",
          name: "Admin",
          email: decoded.email || process.env.ADMIN_EMAIL,
          role: "admin",
        };
        return next();
      }

      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || decoded.role || "user",
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

/**
 * Restrict routes to admins only
 */
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Access denied: Admins only" });
};

/**
 * Restrict routes to specific roles
 */
export const protect = (roles = []) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = await User.findById(decoded.id).select("-password");
      if (!user) {
        user = await Doctor.findById(decoded.id).select("-password");
      }

      if (!user && decoded.role !== "admin") {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      req.user = {
        id: user ? user._id : decoded.id || "admin-id",
        name: user ? user.name : "Admin",
        email: user ? user.email : decoded.email || process.env.ADMIN_EMAIL,
        role: user ? user.role : decoded.role || "admin",
      };

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Forbidden: Role not allowed" });
      }

      next();
    } catch (err) {
      console.error("Protect Middleware Error:", err);
      return res.status(401).json({ success: false, message: "Token invalid" });
    }
  };
};

export default authMiddleware;
