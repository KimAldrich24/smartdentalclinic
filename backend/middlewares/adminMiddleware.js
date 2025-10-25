export const adminMiddleware = (req, res, next) => {
  // ✅ 1. Skip role check if auth is disabled
  if (process.env.AUTH_ENABLED === "false") {
    console.log("🔓 Auth temporarily disabled — adminMiddleware bypassed");

    // Create a fake admin user for development
    req.user = {
      _id: "dev-admin-id",
      name: "Dev Admin",
      email: "admin@example.com",
      role: "admin",
    };

    return next();
  }

  // ✅ 2. Normal behavior when auth is enabled
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized as admin" });
  }

  next();
};
