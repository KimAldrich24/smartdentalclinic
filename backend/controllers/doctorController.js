import Doctor from "../models/doctorModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Service from "../models/serviceModel.js";
/* --------------------------
   Add a new doctor (Admin)
--------------------------- */
export const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      experience,
      fees,
      about,
      speciality,
      degree,
      address,
    } = req.body;

    // ✅ 1. Password required
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // ✅ 2. Password strength validation (BACKEND ENFORCED)
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include an uppercase letter and a number",
      });
    }

    // ✅ 3. Prevent duplicate email
    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Doctor already exists with this email",
      });
    }

    const image = req.file ? req.file.filename : null;

    // ✅ 4. Create doctor (password hashed by model)
    const doctor = await Doctor.create({
      name,
      email,
      password,
      experience,
      fees,
      about,
      speciality: speciality || degree,
      degree,
      address: typeof address === "string" ? JSON.parse(address) : address || {},
      image,
      available: true,
      date: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      doctor,
    });
  } catch (err) {
    console.error("❌ Error adding doctor:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* --------------------------
   Doctor login
--------------------------- */
export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: doctor._id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        degree: doctor.degree,
        experience: doctor.experience,
        speciality: doctor.speciality,
        role: "doctor",
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* --------------------------
   🔹 Get Doctor Profile (protected)
--------------------------- */
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor.id).select("-password");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* --------------------------
   🔹 Fetch all doctors
--------------------------- */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.status(200).json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* --------------------------
   🔹 Get single doctor by ID with services and schedule
--------------------------- */
export const getDoctorById = async (req, res) => {
  try {
    console.log("📋 Fetching doctor with ID:", req.params.id);
    
    const doctor = await Doctor.findById(req.params.id)
      .select("-password")
      .populate('services'); // Populate services
    
    if (!doctor) {
      console.log("❌ Doctor not found");
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    
    // ✅ Debug what's being sent
    console.log("📋 Doctor services (should be objects):", doctor.services);
    console.log("📋 First service type:", typeof doctor.services[0]);
    console.log("📅 Doctor schedule:", doctor.schedule);
    
    res.json({ success: true, doctor });
  } catch (err) {
    console.error("❌ Error in getDoctorById:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* --------------------------
   🔹 Get available slots
--------------------------- */
export const getDoctorSlots = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const today = new Date();
    const daysToShow = 7;
    const slots = [];

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateKey = date.toISOString().split("T")[0];
      const bookedSlots = doctor.slots_book[dateKey] || [];
      const allSlots = ["10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];
      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

      slots.push({ date: dateKey, availableSlots });
    }

    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* --------------------------
   🔹 Book a slot
--------------------------- */
export const bookDoctorSlot = async (req, res) => {
  try {
    const { date, time } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const bookedSlots = doctor.slots_book[date] || [];
    if (bookedSlots.includes(time)) return res.status(400).json({ success: false, message: "Slot already booked" });

    doctor.slots_book[date] = [...bookedSlots, time];
    await doctor.save();

    res.json({ success: true, message: "Appointment booked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* --------------------------
   🔹 Add Doctor Schedule (protected)
--------------------------- */


// Delete doctor (admin only)
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("🗑️ Attempting to delete doctor:", id);
    
    const doctor = await Doctor.findByIdAndDelete(id);
    
    if (!doctor) {
      console.log("❌ Doctor not found");
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    console.log("✅ Doctor deleted successfully:", doctor.email);
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error("❌ Error deleting doctor:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all available services (for doctor to choose from)
// Get all available services (for doctor to choose from)
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find(); // ✅ Use imported Service model
    
    res.json({ success: true, services });
  } catch (err) {
    console.error("❌ Error fetching services:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add service to doctor's profile (doctor selects from existing services)
export const addDoctorService = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const doctorId = req.doctor.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Check if service already added
    if (doctor.services.includes(serviceId)) {
      return res.status(400).json({ success: false, message: 'Service already added' });
    }

    doctor.services.push(serviceId);
    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctorId).populate('services');
    
    console.log("✅ Service added to doctor");
    res.json({ success: true, message: 'Service added successfully', services: updatedDoctor.services });
  } catch (err) {
    console.error("❌ Error adding service:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove service from doctor's profile
export const removeDoctorService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const doctorId = req.doctor.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    doctor.services = doctor.services.filter(s => s.toString() !== serviceId);
    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctorId).populate('services');

    console.log("✅ Service removed from doctor");
    res.json({ success: true, message: 'Service removed successfully', services: updatedDoctor.services });
  } catch (err) {
    console.error("❌ Error removing service:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add/Update schedule (available slots for a date) - UPDATED VERSION
export const addDoctorSchedule = async (req, res) => {
  try {
    const { date, slots } = req.body;
    const doctorId = req.doctor.id;

    // ✅ Check if date is in the past
    const scheduleDate = new Date(date);
    const today = new Date();
    scheduleDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    if (scheduleDate < today) {
      return res.json({ 
        success: false, 
        message: 'Cannot create schedule for past dates' 
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Check if schedule for this date already exists
    const existingScheduleIndex = doctor.schedule.findIndex(s => s.date === date);
    
    if (existingScheduleIndex !== -1) {
      doctor.schedule[existingScheduleIndex].slots = slots;
    } else {
      doctor.schedule.push({ date, slots });
    }

    await doctor.save();

    // ✅ Return only active (non-expired) schedules
    const activeSchedule = doctor.schedule.filter(sch => {
      const schDate = new Date(sch.date);
      schDate.setHours(0, 0, 0, 0);
      return schDate >= today;
    });

    console.log("✅ Schedule added for date:", date);
    res.json({ success: true, message: 'Schedule updated successfully', schedule: activeSchedule });
  } catch (err) {
    console.error("❌ Error adding schedule:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get doctor's services and schedule - UPDATED VERSION
export const getDoctorServicesAndSchedule = async (req, res) => {
  try {
    const doctorId = req.doctor.id;

    const doctor = await Doctor.findById(doctorId).populate('services');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // ✅ Filter out past schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeSchedule = doctor.schedule.filter(sch => {
      const scheduleDate = new Date(sch.date);
      scheduleDate.setHours(0, 0, 0, 0);
      return scheduleDate >= today;
    });

    console.log("✅ Fetched doctor data:", { 
      services: doctor.services.length, 
      activeSchedules: activeSchedule.length 
    });

    res.json({ 
      success: true, 
      schedule: activeSchedule, 
      services: doctor.services || []
    });
  } catch (err) {
    console.error("❌ Error fetching doctor data:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const editDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.doctor.id; // from middleware
    const { scheduleId } = req.params;
    const { date, slots } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // Find schedule by _id
    const schedule = doctor.schedule.id(scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    // Optional: prevent editing booked slots
    if (doctor.slots_book[schedule.date]) {
      return res.status(400).json({ success: false, message: "Cannot edit, some slots are already booked" });
    }

    // Update schedule
    schedule.date = date || schedule.date;
    schedule.slots = slots || schedule.slots;

    await doctor.save();

    res.json({ success: true, message: "Schedule updated successfully", schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.doctorId; // ✅ use the correct field from middleware
    const { scheduleId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // Find schedule by _id
    const schedule = doctor.schedule.id(scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    // Optional: prevent deleting booked slots
    if (doctor.slots_book.get(schedule.date)?.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete, some slots are already booked" });
    }

    // Remove schedule
    schedule.remove();
    await doctor.save();

    // Return updated schedule so frontend can update state
    res.json({ success: true, message: "Schedule deleted successfully", schedule: doctor.schedule });
  } catch (err) {
    console.error("❌ Delete schedule error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


