import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import Service from "../models/serviceModel.js";
import Promotion from "../models/Promotion.js";
import PatientRecord from "../models/patientRecordModel.js";
import fetch from 'node-fetch'; // ✅ Add this import at the top
import { sendSMS, formatAppointmentConfirmationSMS } from "../utils/smsHelper.js"; // ✅ use your

// ✅ Book an appointment (with service price + promotions + SMS)
import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
// ❌ SMS imports intentionally commented
// import { sendSMS, formatAppointmentConfirmationSMS } from "../utils/smsHelper.js";

export const bookAppointment = async (req, res) => {
  console.log("\n🎯 ====== BOOKING ENDPOINT HIT ======");
  console.log("📥 Request body:", req.body);
  console.log("👤 User from auth middleware:", req.user);

  try {
    const { doctorId, date, time } = req.body;
    const userId = req.user._id;

    // ✅ Validate required fields (NO service)
    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date, and time are required",
      });
    }

    // ✅ Validate doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // ❌ Do NOT block slot yet (admin approval first)

    // ✅ Create appointment (service assigned later by doctor)
    const appointment = await Appointment.create({
      user: userId,
      doctor: doctorId,
      service: null,                 // doctor assigns later
      date,
      time,
      status: "PENDING_ADMIN",       // admin approval required
      finalPrice: 0,
      additionalPayment: 0,
      totalPrice: 0,
      paymentStatus: "pending",
      createdBy: userId,
    });

    // ❌ SMS intentionally disabled
    /*
    try {
      if (req.user.phone) {
        const msg = `Your appointment request has been received and is pending admin approval.`;
        await sendSMS(req.user.phone, msg);
      }
    } catch (smsErr) {
      console.error("SMS skipped:", smsErr.message);
    }
    */

    return res.status(201).json({
      success: true,
      message: "Appointment submitted for admin approval",
      appointment,
    });

  } catch (err) {
    console.error("❌ BOOKING ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to book appointment",
    });
  }
};

// ✅ Get logged-in user's appointments
export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const appointments = await Appointment.find({ user: userId })
      .populate("doctor", "name speciality image fees")
      .populate("service", "name price duration")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    console.error("Get My Appointments Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ✅ Admin: Get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor", "name speciality image")
      .populate("user", "name email")
      .populate("service", "name price duration")
      .sort({ date: 1, time: 1 });

    const safeAppointments = appointments.map((appt) => ({
      _id: appt._id,
      doctor: appt.doctor || { name: "Unknown Doctor", speciality: "", image: "" },
      user: appt.user || { name: "Unknown User", email: "" },
      service: appt.service || { name: "Unknown Service", price: 0, duration: "" },
      date: appt.date,
      time: appt.time,
      status: appt.status,
      finalPrice: appt.finalPrice || 0,
    }));

    res.json({ success: true, appointments: safeAppointments });
  } catch (err) {
    console.error("Get All Appointments Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Admin: Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor && doctor.slots_book[appointment.date]) {
      doctor.slots_book[appointment.date] = doctor.slots_book[appointment.date].filter(
        (slot) => slot !== appointment.time
      );
      await doctor.save();
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (err) {
    console.error("Delete Appointment Error:", err);
    res.status(500).json({
      success: false,
      message: "Error deleting appointment",
      error: err.message,
    });
  }
};

// ✅ Admin: Mark appointment as completed and push to patient history
export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate("doctor", "name")
      .populate("service", "name price duration")
      .populate("user", "name email");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.status = "COMPLETED";
    await appointment.save();

    await PatientRecord.create({
      user: appointment.user._id,
      doctor: appointment.doctor._id,
      service: appointment.service._id,
      date: appointment.date,
      notes: "Treatment completed",
    });

    res.json({ success: true, message: "Appointment marked as completed" });
  } catch (err) {
    console.error("Complete Appointment Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "PENDING_ADMIN") {
      return res.status(400).json({ success: false, message: "Cannot cancel this appointment" });
    }

    appointment.status = "CANCELLED";
    await appointment.save();

    return res.json({ success: true, message: "Appointment cancelled", appointment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get appointments for a specific doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.doctor.id;

    console.log("📋 Fetching appointments for doctor:", doctorId);

    const appointments = await Appointment.find({
      doctor: doctorId,
      status: "APPROVED_ADMIN"
    })

      .populate('user', 'name email phone')
      .populate('doctor', 'name degree speciality')
      .populate('service', 'name price duration')
      .sort({ date: -1, time: -1 });

    console.log(`✅ Found ${appointments.length} appointments for doctor`);
    if (appointments.length > 0) {
      console.log("📋 Sample appointment:", {
        id: appointments[0]._id,
        patient: appointments[0].user?.name,
        service: appointments[0].service?.name,
        date: appointments[0].date,
        time: appointments[0].time
      });
    }

    res.json({ success: true, appointments });
  } catch (err) {
    console.error("❌ Error fetching doctor appointments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate("user", "name phone")
      .populate("doctor", "name") // only name populated
      .populate("service", "name");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "PENDING_ADMIN") {
      return res.status(400).json({ success: false, message: "Invalid appointment status" });
    }

    // ✅ Change status
    appointment.status = "APPROVED_ADMIN";
    await appointment.save();

    // ✅ Block the slot: fetch real doctor document
    const doctor = await Doctor.findById(appointment.doctor._id);
    const bookedSlots = doctor.slots_book[appointment.date] || [];
    doctor.slots_book[appointment.date] = [...bookedSlots, appointment.time];
    await doctor.save();

    // ✅ Send SMS
    if (appointment.user.phone) {
      const msg = `Hi ${appointment.user.name}, your appointment with Dr. ${doctor.name} has been approved.`;
      await sendSMS(appointment.user.phone, msg);
    }

    res.json({ success: true, message: "Appointment approved" });
  } catch (err) {
    console.error("Approve Appointment Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

