import Appointment from "../models/appointmentModel.js";
import User from "../models/User.js";
import Service from "../models/serviceModel.js";
import Promotion from "../models/promotion.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const totalPatients = await User.countDocuments(); // ✅ works with user.js
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

    // ✅ Calculate revenue from completed appointments
    const appointments = await Appointment.find({ status: "completed" })
      .populate("service", "price")
      .populate("service", "_id");

    let revenue = 0;

    for (let appt of appointments) {
      if (appt.service) {
        let finalPrice = appt.service.price || 0;

        // Check for active promotions for this service
        const now = new Date();
        const promotion = await Promotion.findOne({
          serviceIds: appt.service._id,
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now },
        });

        if (promotion) {
          finalPrice = finalPrice - (finalPrice * promotion.discountPercentage) / 100;
        }

        revenue += finalPrice;
      }
    }

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
    res.status(500).json({ message: err.message });
  }
};

export const getRecentAppointments = async (req, res) => {
  try {
    const recent = await Appointment.find()
      .populate("user", "name email")
      .populate("doctor", "name specialization")
      .populate("service", "name price")
      .sort({ date: -1 })
      .limit(5);

    res.json(recent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
