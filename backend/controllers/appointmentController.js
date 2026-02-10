import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import Service from "../models/serviceModel.js";
import PatientRecord from "../models/patientRecordModel.js";
import { sendSMS } from "../utils/smsHelper.js";

/* =====================================================
   PATIENT: BOOK APPOINTMENT (DATE & TIME ONLY)
===================================================== */
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const userId = req.user._id;

    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date, and time are required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointment = await Appointment.create({
      user: userId,
      doctor: doctorId,
      date,
      time,
      status: "PENDING_ADMIN",
      services: [],
      totalPrice: 0,
      paymentStatus: "pending",
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment submitted for admin approval",
      appointment,
    });
  } catch (err) {
    console.error("BOOK APPOINTMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
    });
  }
};

/* =====================================================
   PATIENT: GET MY APPOINTMENTS
===================================================== */
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .populate("doctor", "name speciality image")
      .populate("services.service", "name price duration")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   ADMIN: GET ALL APPOINTMENTS
===================================================== */
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor", "name speciality image")
      .populate("user", "name email")
      .populate("services.service", "name price duration")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   ADMIN: APPROVE APPOINTMENT (UNLOCKS DOCTOR)
===================================================== */
export const approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "name phone")
      .populate("doctor", "name");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "PENDING_ADMIN") {
      return res.status(400).json({ success: false, message: "Invalid appointment status" });
    }

    appointment.status = "APPROVED_ADMIN";
    await appointment.save();

    // block time slot
    const doctor = await Doctor.findById(appointment.doctor._id);
    doctor.slots_book[appointment.date] = [
      ...(doctor.slots_book[appointment.date] || []),
      appointment.time,
    ];
    await doctor.save();

    // SMS
    if (appointment.user.phone) {
      await sendSMS(
        appointment.user.phone,
        `Hi ${appointment.user.name}, your appointment with Dr. ${doctor.name} has been approved.`
      );
    }

    res.json({ success: true, message: "Appointment approved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   DOCTOR: GET MY APPOINTMENTS
===================================================== */
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.doctor.id,
      status: { $in: ["PENDING_ADMIN", "APPROVED_ADMIN", "IN_PROGRESS"] },
    })
      .populate("user", "name email phone")
      .populate("services.service", "name price duration")
      .sort({ date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   DOCTOR: ASSIGN MULTIPLE SERVICES
===================================================== */
export const doctorAssignServices = async (req, res) => {
  try {
    const { services } = req.body; 
    // services = [{ serviceId, price }]

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "APPROVED_ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Services can only be assigned after admin approval",
      });
    }

    const formattedServices = [];

    for (const s of services) {
      const service = await Service.findById(s.serviceId);
      if (!service) continue;

      formattedServices.push({
        service: service._id,
        price: s.price ?? service.price,
      });
    }

    appointment.services = formattedServices;
    appointment.status = "IN_PROGRESS";
    await appointment.save();

    res.json({
      success: true,
      message: "Services assigned successfully",
      appointment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   DOCTOR: COMPLETE APPOINTMENT
===================================================== */
export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "_id")
      .populate("doctor", "_id");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.status = "COMPLETED";
    await appointment.save();

    await PatientRecord.create({
      user: appointment.user._id,
      doctor: appointment.doctor._id,
      services: appointment.services,
      date: appointment.date,
      notes: "Treatment completed",
    });

    res.json({ success: true, message: "Appointment completed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   CANCEL / DELETE
===================================================== */
export const cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment || appointment.status !== "PENDING_ADMIN") {
    return res.status(400).json({ success: false, message: "Cannot cancel appointment" });
  }

  appointment.status = "CANCELLED";
  await appointment.save();
  res.json({ success: true, message: "Appointment cancelled" });
};

export const deleteAppointment = async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Appointment deleted" });
};
// =================== ADMIN COMPLETE APPOINTMENT ===================
export const adminCompleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "_id name phone email")
      .populate("doctor", "_id name");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "IN_PROGRESS") {
      return res.status(400).json({ success: false, message: "Appointment is not in progress" });
    }

    // Mark as COMPLETED for admin
    appointment.status = "COMPLETED";
    appointment.paymentStatus = "pending"; // patient needs to pay
    await appointment.save();

    // Create patient history
    await PatientRecord.create({
      user: appointment.user,
      doctor: appointment.doctor,
      appointment: appointment._id,
      services: appointment.services.map(s => ({
        service: s.service,
        price: s.price,
      })),
    });
    

    res.json({ success: true, message: "Appointment marked as completed", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// controllers/appointmentController.js

// Fetch completed appointments for a patient
export const getPatientCompletedAppointments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Only fetch COMPLETED appointments
    const appointments = await Appointment.find({
      user: userId,
      status: "COMPLETED",
    })
      .populate("doctor", "name email speciality")
      .populate("services.service", "name price duration")
      .sort({ date: -1, time: -1 });

    res.json({ success: true, records: appointments });
  } catch (err) {
    console.error("Error fetching patient completed appointments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

