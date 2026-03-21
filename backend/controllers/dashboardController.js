import Appointment from "../models/appointmentModel.js";
import User from "../models/User.js";
import Service from "../models/serviceModel.js";
import Credit from "../models/creditModel.js";

// ================= DASHBOARD STATS =================
export const getDashboardStats = async (req, res) => {
  try {
    // Total appointments & patients
    const totalAppointments = await Appointment.countDocuments();
    const totalPatients = await User.countDocuments({ role: "patient" });

    // Monthly appointments (use createdAt)
    const monthlyAppointments = await Appointment.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Revenue from completed & paid appointments
    const completedAppointments = await Appointment.find({
      status: { $in: ["COMPLETED", "completed"] },
      paymentStatus: { $in: ["Paid", "paid", "paid_cash"] },
    });

    let revenue = 0;
    for (let appt of completedAppointments) {
      revenue += (appt.totalPrice || 0) + (appt.additionalPayment || 0);
    }

    res.json({
      totalAppointments,
      totalPatients,
      revenue,
      monthlyAppointments,
      demographics: [
        { name: "Male", value: 60 },   // you can replace with real data later
        { name: "Female", value: 40 },
      ],
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= RECENT APPOINTMENTS =================
export const getRecentAppointments = async (req, res) => {
  try {
    const recent = await Appointment.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("patient", "name email")      // <--- patient instead of user
      .populate("doctor", "name specialization")
      .populate("services", "name price")
      .populate("bookedBy", "name email");    // <--- bookedBy instead of createdBy

    // Map fields to match frontend
    const mappedRecent = recent.map(a => ({
      ...a.toObject(),
      user: a.patient,                // frontend expects 'user'
      createdBy: a.bookedBy,          // frontend expects 'createdBy'
      paymentStatus: a.paymentStatus === "paid_cash" ? "Paid" : a.paymentStatus,
    }));

    res.json({ appointments: mappedRecent });
  } catch (err) {
    console.error("Recent appointments error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= PATIENT CREDITS =================
export const getCredits = async (req, res) => {
  try {
    const credits = await Credit.find()
      .populate("user", "name email"); // populate patient name/email

    res.json(credits); // frontend expects array of { user, amount, history }
  } catch (err) {
    console.error("Error fetching credits:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};