import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import Service from "../models/serviceModel.js";
import User from "../models/userModel.js"; // ✅ Make sure User is imported
import PatientRecord from "../models/patientRecordModel.js";
import { sendSMS } from "../utils/smsHelper.js";
import Credit from "../models/creditModel.js"; // make sure you have this model
import Equipment from "../models/equipmentModel.js"; 
/* =====================================================
   PATIENT: BOOK APPOINTMENT
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
    if (!doctor)
      return res.status(404).json({ success: false, message: "Doctor not found" });

    // ✅ 1. CHECK IF SLOT ALREADY BOOKED
    const existingSlot = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $in: ["PENDING_ADMIN", "APPROVED_ADMIN", "IN_PROGRESS"] },
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    // ✅ 2. PREVENT SAME USER DOUBLE BOOK
    const existingUser = await Appointment.findOne({
      doctor: doctorId,
      patient: userId,
      date,
      time,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "You already booked this slot",
      });
    }

    // ✅ 3. CREATE APPOINTMENT
    const appointment = await Appointment.create({
      patient: userId,
      bookedBy: userId,
      doctor: doctorId,
      date,
      time,
      status: "PENDING_ADMIN",
      services: [],
      totalPrice: 0,
      paymentStatus: "pending",
      createdBy: userId,
    });

    // ✅ 4. RESERVE SLOT IMMEDIATELY
    doctor.slots_book[date] = [
      ...(doctor.slots_book[date] || []),
      time,
    ];
    await doctor.save();

    res.status(201).json({
      success: true,
      message: "Appointment submitted for admin approval",
      appointment,
    });
  } catch (err) {
    console.error("BOOK APPOINTMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: err.message,
    });
  }
};
/* =====================================================
   PATIENT: BOOK APPOINTMENT FOR CHILD
===================================================== */
export const bookChildAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, childId } = req.body;
    const guardianId = req.user._id;

    if (!doctorId || !date || !time || !childId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor, date, time, and child are required" });
    }

    const guardian = await User.findById(guardianId);
    if (!guardian) {
      return res
        .status(403)
        .json({ success: false, message: "Guardian not found or unauthorized" });
    }

    // Make sure child exists in guardian's children array
    const child = guardian.children.find((c) => c._id.toString() === childId);
    if (!child) {
      return res.status(404).json({ success: false, message: "Child not found" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // ✅ CHECK IF SLOT ALREADY BOOKED
const existingSlot = await Appointment.findOne({
  doctor: doctorId,
  date,
  time,
  status: { $in: ["PENDING_ADMIN", "APPROVED_ADMIN", "IN_PROGRESS"] },
});

if (existingSlot) {
  return res.status(400).json({
    success: false,
    message: "This time slot is already booked",
  });
}

    const appointment = new Appointment({
      patient: childId,
      bookedBy: guardianId,
      doctor: doctorId,
      date,
      time,
      status: "PENDING_ADMIN",
      services: [],
      totalPrice: 0,
      paymentStatus: "pending",
      createdBy: guardianId,
    });

    await appointment.save();

    res
      .status(201)
      .json({ success: true, message: "Appointment booked for child", appointment });
  } catch (err) {
    console.error("[ERROR] bookChildAppointment:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to book appointment", error: err.message });
  }
};

/* =====================================================
   PATIENT: GET MY APPOINTMENTS
===================================================== */
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [
        { patient: req.user._id },   // appointments booked for self
        { bookedBy: req.user._id },  // appointments booked for children
      ],
    })
      .populate("doctor", "name speciality image")     // doctor info
      .populate("patient", "name")                     // patient (child or self)
      .populate("services.service", "name price duration")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    console.error("GET MY APPOINTMENTS ERROR:", err);
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
      .populate("patient", "name email")
      .populate("services.service", "name price duration")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   ADMIN: APPROVE APPOINTMENT
===================================================== */
/* =====================================================
   ADMIN: APPROVE APPOINTMENT
===================================================== */
export const approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name phone")
      .populate("doctor", "name");

    if (!appointment) 
      return res.status(404).json({ success: false, message: "Appointment not found" });

    if (appointment.status !== "PENDING_ADMIN") 
      return res.status(400).json({ success: false, message: "Invalid appointment status" });

    // ✅ 1. Update status
    appointment.status = "APPROVED_ADMIN";
    await appointment.save();

    // ✅ 2. Block doctor slot
    const doctor = await Doctor.findById(appointment.doctor._id);
    doctor.slots_book[appointment.date] = [
      ...(doctor.slots_book[appointment.date] || []),
      appointment.time,
    ];
    await doctor.save();

    // ✅ 3. Send SMS to patient
    if (appointment.patient?.phone) {
      const message = `Hi ${appointment.patient.name}, your appointment with Dr. ${doctor.name} on ${appointment.date} at ${appointment.time} has been approved.`;
      await sendSMS(appointment.patient.phone, message);
    }

    res.json({ success: true, message: "Appointment approved and SMS sent" });
  } catch (err) {
    console.error("APPROVE APPOINTMENT ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   DOCTOR: GET MY APPOINTMENTS
===================================================== */
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.doctor._id,
      status: { $in: ["PENDING_ADMIN", "APPROVED_ADMIN", "IN_PROGRESS"] },
    })
      .populate("patient", "name email phone")
      .populate("services.service", "name price duration")
      .sort({ date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   DOCTOR: ASSIGN SERVICES
===================================================== */
export const doctorAssignServices = async (req, res) => {
  try {
    const { services, usedEquipment } = req.body; 
    // services = [{ serviceId, price }]
    // usedEquipment = { equipmentId: quantityUsed }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ success: false, message: "Appointment not found" });

    if (appointment.status !== "APPROVED_ADMIN")
      return res.status(400).json({ success: false, message: "Can only assign services after admin approval" });

    // Format services
    const formattedServices = [];
    for (const s of services) {
      const service = await Service.findById(s.serviceId);
      if (!service) continue;
      formattedServices.push({ service: service._id, price: s.price ?? service.price });
    }

    appointment.services = formattedServices;
    appointment.status = "IN_PROGRESS";
    await appointment.save();

    // ============================
    // Deduct used equipment quantities
    // ============================
    if (usedEquipment && typeof usedEquipment === "object") {
      for (const [eqId, qty] of Object.entries(usedEquipment)) {
        const equipment = await Equipment.findById(eqId);
        if (!equipment) continue;

        const usedQty = Number(qty) || 0;
        equipment.quantity = Math.max(equipment.quantity - usedQty, 0);
        await equipment.save();
      }
    }

    res.json({ success: true, message: "Services assigned and equipment updated", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   DOCTOR: COMPLETE APPOINTMENT
===================================================== */
export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    appointment.status = "COMPLETED";
    await appointment.save();

    await PatientRecord.create({
      user: appointment.patient,  // <-- changed from appointment.user
      doctor: appointment.doctor,
      services: appointment.services,
      date: appointment.date,
      notes: "Treatment completed",
    });

    await addCreditFromAppointment(appointment); // pass appointment object

    res.json({ success: true, message: "Appointment completed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   CANCEL / DELETE
===================================================== */
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment || appointment.status !== "PENDING_ADMIN") return res.status(400).json({ success: false, message: "Cannot cancel appointment" });

    appointment.status = "CANCELLED";
    await appointment.save();
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   ADMIN COMPLETE APPOINTMENT
===================================================== */
export const adminCompleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    if (appointment.status !== "IN_PROGRESS") return res.status(400).json({ success: false, message: "Appointment not in progress" });

    appointment.status = "COMPLETED";
    appointment.paymentStatus = "Paid";
    await appointment.save();

    await PatientRecord.create({
      user: appointment.patient, // <-- changed from appointment.user
      doctor: appointment.doctor,
      appointment: appointment._id,
      services: appointment.services,
      date: appointment.date,
      notes: "Treatment completed",
    });

    await addCreditFromAppointment(appointment); // pass appointment object

    res.json({ success: true, message: "Appointment marked completed", appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


/* =====================================================
   ADMIN: GET COMPLETED APPOINTMENTS FOR PATIENT
===================================================== */
// Admin fetch completed appointments for a patient (self + children)
export const getPatientCompletedAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log("Fetching completed appointments for:", patientId);

    const parent = await User.findById(patientId).select("children");
    const childIds = parent?.children?.map(c => c._id) || [];
    const idsToCheck = [patientId, ...childIds];

    const appointments = await Appointment.find({
      $or: [
        { patient: { $in: idsToCheck } },
        { bookedBy: { $in: idsToCheck } } // include who booked
      ],
      status: { $regex: /completed/i } // match any case: Completed, COMPLETED, completed
    })
      .populate("doctor", "name email speciality")
      .populate("patient", "name")
      .populate("services.service", "name price duration")
      .sort({ date: -1, time: -1 });

    console.log("Appointments found:", appointments.length);

    res.json({ success: true, appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
/* =====================================================
   ADMIN: ADD PRESCRIPTION
===================================================== */
// ✅ Add prescription (for completed appointments)
export const addPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const { medicines, notes } = req.body;

    if (!patientId || !appointmentId || !medicines?.length) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) 
      return res.status(404).json({ success: false, message: "Appointment not found" });

    if (appointment.status !== "COMPLETED") {
      return res.status(400).json({ success: false, message: "Appointment is not completed" });
    }

    // Create prescription
    const prescription = await Prescription.create({
      patient: appointment.patient,
      doctor: appointment.doctor,
      medicines,  // <-- match frontend
      notes,
      appointment: appointment._id,
    });

    res.json({ success: true, prescription });
  } catch (err) {
    console.error("[ERROR] addPrescription:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
/* =====================================================
   ADMIN / PATIENT: GET PRESCRIPTIONS
===================================================== */
// ✅ Get prescriptions (for patient or admin)
export const getPrescriptions = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.query;

    const filter = {};
    if (patientId) filter.patient = patientId;
    if (appointmentId) filter.appointment = appointmentId;

    const prescriptions = await Prescription.find(filter)
      .populate("doctor", "name email speciality")
      .populate("patient", "name email");

    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("[ERROR] getPrescriptions:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Add or update patient credit when appointment is completed
const addCreditFromAppointment = async (appointment) => {
  if (!appointment.patient) return;

  const creditAmount = appointment.totalPrice || 0; // or some calculation
  let credit = await Credit.findOne({ user: appointment.patient });

  if (credit) {
    credit.amount += creditAmount;
    credit.history.push({
      appointment: appointment._id,
      amount: creditAmount,
      date: new Date(),
    });
  } else {
    credit = new Credit({
      user: creditUserId, // ✅ corrected
      amount: creditAmount,
      history: [
        {
          appointment: appointment._id,
          amount: creditAmount,
          date: new Date(),
        },
      ],
    });
  }

  await credit.save();
};

/* =====================================================
   ADMIN: MARK APPOINTMENT AS PAID
===================================================== */
export const markAppointmentAsPaid = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    // Only allow marking unpaid appointments as Paid
    if (appointment.paymentStatus === "Paid") {
      return res.status(400).json({ success: false, message: "Appointment is already marked as Paid" });
    }

    appointment.paymentStatus = "Paid";
    await appointment.save();

    res.json({ success: true, message: "Appointment marked as Paid", appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add Walk-in Appointment (Admin / Receptionist)
export const addWalkInAppointment = async (req, res) => {
  try {
    const { patientName, patientEmail, patientPhone, doctorId, date, time, service } = req.body;

    // --- 1. Check if patient already exists ---
    let patient = await User.findOne({ email: patientEmail.trim().toLowerCase() });

    if (!patient) {
      // Generate random password
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Create new patient
      patient = await User.create({
        name: patientName,
        email: patientEmail.trim().toLowerCase(),
        phone: patientPhone,
        password: hashedPassword,
        role: "patient",
        verified: true,
      });
    }

    // --- 2. Get doctor ---
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // --- 3. Create appointment ---
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      bookedBy: patient._id, // Since no admin/receptionist login, set patient as bookedBy
      date,
      time,
      // Map service to services array if provided
      services: service
        ? [{ service: null, price: 0 }] // optional: set service ID & price if needed
        : [],
      status: "APPROVED_ADMIN", // Auto-approved walk-in
      type: "walk-in",
      paymentStatus: "pending",
    });

    // --- 4. Add to doctor's appointments ---
    doctor.appointments.push(appointment._id);
    await doctor.save();

    res.status(201).json({ success: true, appointment, patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};