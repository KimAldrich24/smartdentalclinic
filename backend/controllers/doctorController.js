import Doctor from "../models/doctorModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
      address1,
    } = req.body;

    if (!password) return res.status(400).json({ success: false, message: 'Password is required' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Image from multer
    const image = req.file ? req.file.filename : null;

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      experience,
      fees,
      about,
      speciality,
      degree,
      address: address1 ? JSON.parse(address1) : {},
      image,
      available: true,
      date: Date.now(),
    });

    res.status(201).json({ success: true, doctor, message: 'Doctor added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/* --------------------------
   Doctor login
--------------------------- */
export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

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
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
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
   🔹 Get single doctor by ID
--------------------------- */
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.json({ success: true, doctor });
  } catch (err) {
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
export const addDoctorSchedule = async (req, res) => {
  try {
    const { date, times } = req.body;
    const doctor = await Doctor.findById(req.doctor.id);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    doctor.slots_book[date] = times;
    await doctor.save();

    res.json({ success: true, message: "Schedule added successfully", slots_book: doctor.slots_book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
