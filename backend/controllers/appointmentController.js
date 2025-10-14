import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import Service from "../models/serviceModel.js";
import Promotion from "../models/Promotion.js";
import PatientRecord from "../models/patientRecordModel.js"; // make sure this exists

// ✅ Book an appointment (with service price + promotions)
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, serviceId, date, time } = req.body; // include serviceId
    const userId = req.user.id; // from authMiddleware

    if (!doctorId || !serviceId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Doctor, service, date, and time are required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Check if slot already booked
    const bookedSlots = doctor.slots_book[date] || [];
    if (bookedSlots.includes(time)) {
      return res.status(400).json({
        success: false,
        message: "This slot is already booked",
      });
    }

    // 🔍 Check active promotions for this service
    const promo = await Promotion.findOne({
      serviceIds: serviceId,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    let finalPrice = service.price;

    if (promo) {
      finalPrice = service.price - (service.price * promo.discountPercentage / 100);
    }

    // ✅ Create appointment record with final price
    const appointment = await Appointment.create({
      user: userId,
      doctor: doctor._id,
      service: serviceId,
      date,
      time,
      finalPrice,
      status: "booked",
    });

    // ✅ Block the slot in doctor document
    doctor.slots_book[date] = [...bookedSlots, time];
    await doctor.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (err) {
    console.error("Book Appointment Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
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
      finalPrice: appt.finalPrice || 0, // add final price
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

    appointment.status = "completed";
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

    if (appointment.status !== "booked") {
      return res.status(400).json({ success: false, message: "Cannot cancel this appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.json({ success: true, message: "Appointment cancelled", appointment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};










