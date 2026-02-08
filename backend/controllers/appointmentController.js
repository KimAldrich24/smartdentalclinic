import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import Service from "../models/serviceModel.js";
import Promotion from "../models/Promotion.js";
import PatientRecord from "../models/patientRecordModel.js";
import fetch from 'node-fetch'; // ✅ Add this import at the top
import { sendSMS, formatAppointmentConfirmationSMS } from "../utils/smsHelper.js"; // ✅ use your

// ✅ Book an appointment (with service price + promotions + SMS)
export const bookAppointment = async (req, res) => {
  console.log("\n🎯 ====== BOOKING ENDPOINT HIT ======");
  console.log("📥 Request body:", req.body);
  console.log("👤 User from auth middleware:", req.user);

  try {
    const { doctorId, serviceId, date, time, promotionId } = req.body; // ✅ includes promotionId
    const userId = req.user._id;

    if (!doctorId || !serviceId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Doctor, service, date, and time are required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    const bookedSlots = doctor.slots_book[date] || [];
    if (bookedSlots.includes(time)) {
      return res.status(400).json({ success: false, message: "This slot is already booked" });
    }

    // ✅ Determine final price (service price or discounted)
    let finalPrice = service.price;
    let appliedPromo = null;

    if (promotionId) {
      const promo = await Promotion.findById(promotionId);

      if (!promo) {
        console.log("⚠️ Promotion not found.");
      } else {
        const serviceMatch = promo.serviceIds.some(
          id => id.toString() === serviceId.toString()
        );
        const now = new Date();
        const withinDateRange =
          new Date(promo.startDate) <= now && new Date(promo.endDate) >= now;

        console.log("🔍 Promo debug:", {
          promoTitle: promo.title,
          isActive: promo.isActive,
          serviceMatch,
          withinDateRange,
          discount: promo.discountPercentage,
        });

        if (promo.isActive && serviceMatch && withinDateRange) {
          appliedPromo = promo;
          finalPrice = service.price * (1 - promo.discountPercentage / 100);
          console.log(
            `🎉 Promotion applied: ${promo.title} (${promo.discountPercentage}% OFF)`
          );
        } else {
          console.log("⚠️ Promotion conditions not met.");
        }
      }
    }


    // ✅ Create appointment record
    const appointment = await Appointment.create({
      user: userId,
      doctor: doctor._id,
      service: service._id,
      date,
      time,
      finalPrice,
      promotion: appliedPromo?._id || null,
      status: "PENDING_ADMIN",

    });

    // ✅ Block the slot
    // doctor.slots_book[date] = [...bookedSlots, time];
    // await doctor.save();

    // // ✅ Send SMS confirmation (using your helper)
    // try {
    //   const patientName = req.user.name || "Patient";
    //   const doctorName = doctor.name;
    //   const serviceName = service.name;
    //   const formattedDate = new Date(date).toLocaleDateString("en-US", {
    //     month: "short",
    //     day: "numeric",
    //     year: "numeric",
    //   });
    //   const smsMessage = formatAppointmentConfirmationSMS(
    //     patientName,
    //     doctorName,
    //     appliedPromo
    //       ? `${serviceName} (${appliedPromo.title} ${appliedPromo.discountPercentage}% off)`
    //       : serviceName,
    //     formattedDate,
    //     time,
    //     finalPrice.toFixed(2)
    //   );

    //   if (req.user.phone) {
    //     await sendSMS(req.user.phone, smsMessage);
    //     console.log("📱 SMS sent successfully to:", req.user.phone);
    //   } else {
    //     console.log("⚠️ No phone number found, skipping SMS");
    //   }
    // } catch (smsErr) {
    //   console.error("❌ SMS sending error:", smsErr.message);
    // }

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });

  } catch (err) {
    console.error("❌ BOOKING ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
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

