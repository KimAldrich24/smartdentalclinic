import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import Service from "../models/serviceModel.js";
import Promotion from "../models/Promotion.js";
import PatientRecord from "../models/patientRecordModel.js"; // make sure this exists

// ✅ Book an appointment (with service price + promotions)
export const bookAppointment = async (req, res) => {
  console.log("\n🎯 ====== BOOKING ENDPOINT HIT ======");
  console.log("📥 Request body:", req.body);
  console.log("👤 User from auth middleware:", req.user);
  console.log("🔑 User ID:", req.user?.id);
  
  try {
    const { doctorId, serviceId, date, time } = req.body;
    const userId = req.user._id;

    console.log("📋 Extracted booking data:");
    console.log("  Doctor ID:", doctorId);
    console.log("  Service ID:", serviceId);
    console.log("  Date:", date);
    console.log("  Time:", time);
    console.log("  User ID:", userId);

    if (!doctorId || !serviceId || !date || !time) {
      console.log("❌ Validation failed - missing required fields");
      return res.status(400).json({
        success: false,
        message: "Doctor, service, date, and time are required",
      });
    }

    console.log("🔍 Looking up doctor...");
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log("❌ Doctor not found");
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    console.log("✅ Doctor found:", doctor.name);

    console.log("🔍 Looking up service...");
    const service = await Service.findById(serviceId);
    if (!service) {
      console.log("❌ Service not found");
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    console.log("✅ Service found:", service.name);

    // Check if slot already booked
    const bookedSlots = doctor.slots_book[date] || [];
    console.log("📅 Booked slots for", date, ":", bookedSlots);
    
    if (bookedSlots.includes(time)) {
      console.log("❌ Slot already booked");
      return res.status(400).json({
        success: false,
        message: "This slot is already booked",
      });
    }
    console.log("✅ Slot is available");

    // Check active promotions for this service
    console.log("🔍 Checking for promotions...");
    const promo = await Promotion.findOne({
      serviceIds: serviceId,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    let finalPrice = service.price;
    if (promo) {
      finalPrice = service.price - (service.price * promo.discountPercentage / 100);
      console.log("🎉 Promotion applied:", promo.title, "- Final price:", finalPrice);
    } else {
      console.log("💵 No promotion - using base price:", finalPrice);
    }

    // Create appointment record
    console.log("💾 Creating appointment...");
    const appointment = await Appointment.create({
      user: userId,
      doctor: doctor._id,
      service: serviceId,
      date,
      time,
      finalPrice,
      status: "booked",
    });
    console.log("✅ Appointment created:", appointment._id);

    // Block the slot in doctor document
    console.log("🔒 Blocking slot in doctor's schedule...");
    doctor.slots_book[date] = [...bookedSlots, time];
    await doctor.save();
    console.log("✅ Doctor schedule updated");

    console.log("📤 Sending success response...");
    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
    console.log("✅ Response sent successfully!\n");
    
  } catch (err) {
    console.error("❌ ====== BOOKING ERROR ======");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
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

// Get appointments for a specific doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.doctor.id; // From doctorAuthMiddleware
    
    console.log("📋 Fetching appointments for doctor:", doctorId);
    
    // ✅ Use 'doctor' field, not 'docId'
    const appointments = await Appointment.find({ doctor: doctorId })
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






