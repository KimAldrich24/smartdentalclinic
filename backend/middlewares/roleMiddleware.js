export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // ✅ 1. Skip role check if auth is disabled
    if (process.env.AUTH_ENABLED === "false") {
      console.log("🔓 Auth disabled — roleMiddleware bypassed");

      // Inject a fake user role for dev mode
      req.user = {
        _id: "dev-user-id",
        name: "Dev User",
        email: "dev@example.com",
        role: allowedRoles[0] || "admin", // pick first allowed or default to admin
      };

      return next();
    }

    // ✅ 2. Normal behavior (production mode)
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Role not allowed" });
    }

    next();
  };
};
