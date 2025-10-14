// routes/adminAppointmentRoutes.js
import express from "express";
import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";
import Service from "../models/serviceModel.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post(
  "/admin",
  adminAuthMiddleware,
  asyncHandler(async (req, res) => {
    const { doctorId, userId, serviceId, date, time, finalPrice, status } = req.body;

    // Validate required fields
    if (!doctorId || !userId || !serviceId || !date || !time || finalPrice === undefined) {
      res.status(400);
      throw new Error("doctorId, userId, serviceId, date, time, and finalPrice are required");
    }

    // Verify doctor, user, service exist
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const service = await Service.findById(serviceId);
    if (!service) throw new Error("Service not found");

    // Optional: check for conflict if desired
    const conflict = await Appointment.findOne({ doctor: doctorId, date, time, status: { $ne: "cancelled" } });
    if (conflict) {
      // Admin can bypass if you want; else throw
      // throw new Error("Doctor already booked at this time");
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctor: doctorId,
      user: userId,
      service: serviceId,
      date,
      time,
      status: status || "booked",
      finalPrice,
      createdBy: req.user._id, // Optional: add this field in schema for audit
    });

    res.status(201).json(appointment);
  })
);

export default router;
