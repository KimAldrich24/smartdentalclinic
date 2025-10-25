import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Staff from "../models/staffModel.js";
import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";

const roleModelMap = {
  admin: Admin,
  staff: Staff,
  doctor: Doctor,
  patient: User,
  user: User,
};

export default function protect(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      if (process.env.AUTH_ENABLED === "false") {
        req.user = {
          _id: "dev-id",
          name: "Dev User",
          email: "dev@example.com",
          role: allowedRoles[0] || "admin",
        };
        return next();
      }

      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const role = decoded.role?.toLowerCase();

      if (!role || !roleModelMap[role]) {
        return res.status(401).json({ message: "Invalid role in token" });
      }

      const UserModel = roleModelMap[role];
      const user = await UserModel.findById(decoded.id).select("-password");

      if (!user) return res.status(404).json({ message: "User not found" });

      req.user = user;

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: Role not allowed" });
      }

      next();
    } catch (err) {
      console.error("Protect Middleware Error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}
