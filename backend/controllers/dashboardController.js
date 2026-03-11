import Appointment from "../models/appointmentModel.js";
import User from "../models/User.js";
import Service from "../models/serviceModel.js";
import Credit from "../models/creditModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const totalPatients = await User.countDocuments();

    // Monthly appointments
    const monthlyAppointments = await Appointment.aggregate([
      {
        $group: {
          _id: { $month: { $dateFromString: { dateString: "$date" } } },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Revenue from COMPLETED & PAID appointments
    const completedAppointments = await Appointment.find({
      status: "COMPLETED",          // uppercase to match your DB
      paymentStatus: "Paid",        // only count paid
    });

    let revenue = 0;
    for (let appt of completedAppointments) {
      revenue += (appt.totalPrice || 0) + (appt.additionalPayment || 0);
    }

    console.log(`💰 Total revenue: ₱${revenue} from ${completedAppointments.length} paid appointments`);

    res.json({
      totalAppointments,
      totalPatients,
      revenue,
      monthlyAppointments,
      demographics: [
        { name: "Male", value: 60 },
        { name: "Female", value: 40 },
      ],
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getRecentAppointments = async (req, res) => {
  try {
    const recent = await Appointment.find()
      .sort({ updatedAt: -1 })       // show recently updated first
      .limit(5)
      .populate("user", "name email")
      .populate("doctor", "name specialization")
      .populate("services", "name price")
      .populate("createdBy", "name email");

    res.json({ appointments: recent });  // wrap in appointments key for frontend
  } catch (err) {
    console.error("Recent appointments error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getCredits = async (req, res) => {
  try {
    const credits = await Credit.find()
      .populate("user", "name email"); // <--- populate user

    res.json(credits);
  } catch (err) {
    console.error("Error fetching credits:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};