import mongoose from "mongoose";
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
      return res
        .status(400)
        .json({ success: false, message: "Doctor, date, and time are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor)
      return res.status(404).json({ success: false, message: "Doctor not found" });

    const appointment = await Appointment.create({
      patient: userId, // patient is the logged-in user
      bookedBy: userId, // booked by themselves
      doctor: doctorId,
      date,
      time,
      status: "PENDING_ADMIN",
      services: [],
      totalPrice: 0,
      paymentStatus: "pending",
      createdBy: userId,
    });

    res
      .status(201)
      .json({ success: true, message: "Appointment submitted for admin approval", appointment });
  } catch (err) {
    console.error("BOOK APPOINTMENT ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to book appointment", error: err.message });
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
export const approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name phone")
      .populate("doctor", "name");

    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    if (appointment.status !== "PENDING_ADMIN") return res.status(400).json({ success: false, message: "Invalid appointment status" });

    appointment.status = "APPROVED_ADMIN";
    await appointment.save();

    // Block doctor slot
    const doctor = await Doctor.findById(appointment.doctor._id);
    doctor.slots_book[appointment.date] = [...(doctor.slots_book[appointment.date] || []), appointment.time];
    await doctor.save();

    // Send SMS
    if (appointment.patient.phone) {
      await sendSMS(appointment.patient.phone, `Hi ${appointment.user.name}, your appointment with Dr. ${doctor.name} has been approved.`);
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
export const getPatientCompletedAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    const objectUserId = mongoose.Types.ObjectId(userId);

    const appointments = await Appointment.find({ patient: objectUserId, status: "COMPLETED" })
      .populate("doctor", "name email speciality")
      .populate("services.service", "name price duration")
      .sort({ date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   ADMIN: ADD PRESCRIPTION
===================================================== */
export const addPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const { medicines, notes } = req.body;

    if (!patientId || !appointmentId || !medicines?.length) return res.status(400).json({ success: false, message: "Missing required fields" });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    const prescription = await PatientRecord.create({
      user: patientId,
      doctor: appointment.doctor,
      appointment: appointmentId,
      services: medicines.map(m => ({
        service: m.name,
        dosage: m.dosage,
        instructions: m.instructions,
      })),
      notes,
      date: new Date(),
    });

    res.json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
/* =====================================================
   ADMIN / PATIENT: GET PRESCRIPTIONS
===================================================== */
export const getPrescriptions = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.query; // optional filters

    const filter = {};
    if (patientId) filter.user = patientId;
    if (appointmentId) filter.appointment = appointmentId;

    const prescriptions = await PatientRecord.find(filter)
      .populate("doctor", "name email speciality")
      .populate("user", "name email")
      .populate("services.service", "name price");

    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
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

