import Appointment from "../models/appointmentModel.js";
import User from "../models/User.js";
import Service from "../models/serviceModel.js";

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

    // Calculate revenue from completed appointments
    const completedAppointments = await Appointment.find({ status: "completed" });
    
    let revenue = 0;
    for (let appt of completedAppointments) {
      revenue += appt.finalPrice || 0;
    }

    console.log(`💰 Total revenue calculated: ₱${revenue} from ${completedAppointments.length} completed appointments`);

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
      .sort({ date: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("doctor", "name specialization")
      .populate("services", "name price")       // ✅ note plural 'services'
      .populate("createdBy", "name email");     // ✅ populate creator info

    res.json(recent);
  } catch (err) {
    console.error("Recent appointments error:", err);
    res.status(500).json({ message: err.message });
  }
};
