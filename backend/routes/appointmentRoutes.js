import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  deleteAppointment,
  cancelAppointment,
  completeAppointment,
} from "../controllers/appointmentController.js";

import authMiddleware, { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ User: Book appointment
router.post("/book", authMiddleware, bookAppointment);

// ✅ User: Get my appointments
router.get("/my", authMiddleware, getMyAppointments);

// ✅ Admin: Get all appointments
// Only users with role "admin" can access
router.get("/all", protect(["admin"]), getAllAppointments);

// ✅ Admin: Delete appointment
router.delete("/:id", protect(["admin"]), deleteAppointment);

// ✅ Admin: Mark appointment as done
router.put("/:id/complete", protect(["admin"]), completeAppointment);

// ✅ Cancel appointment route (user can cancel their own)
router.put("/:id/cancel", authMiddleware, cancelAppointment);

export default router;
