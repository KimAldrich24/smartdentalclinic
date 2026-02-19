// controllers/doctorScheduleRequestController.js
import DoctorScheduleRequest from "../models/DoctorScheduleRequest.js";

// Doctor pushes schedule
export const pushScheduleRequest = async (req, res) => {
  try {
    const { date, slots } = req.body;
    const doctorId = req.doctor._id;

    const request = await DoctorScheduleRequest.create({
      doctor: doctorId,
      date,
      slots,
    });

    res.json({ success: true, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to push schedule" });
  }
};

// Admin fetches all requests
export const getAllScheduleRequests = async (req, res) => {
  try {
    const requests = await DoctorScheduleRequest.find()
      .populate("doctor", "name speciality email")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
};

// Get schedules for logged-in doctor
export const getDoctorSchedules = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const requests = await DoctorScheduleRequest.find({ doctor: doctorId })
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch schedules" });
  }
};


