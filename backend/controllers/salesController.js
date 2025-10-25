import Appointment from "../models/appointmentModel.js";

export const getSalesReport = async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: "completed" })
      .populate("doctor", "name")
      .populate("service", "name price");

    // Group revenue by month
    const monthlyRevenue = {};
    const serviceRevenue = {};
    const doctorRevenue = {};

    appointments.forEach((appt) => {
      const date = new Date(appt.date);
      const month = date.toLocaleString("default", { month: "short", year: "numeric" });

      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + appt.totalAmount;

      // Per service
      const serviceName = appt.service?.name || "Unknown Service";
      serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + appt.totalAmount;

      // Per doctor
      const doctorName = appt.doctor?.name || "Unknown Doctor";
      doctorRevenue[doctorName] = (doctorRevenue[doctorName] || 0) + appt.totalAmount;
    });

    res.json({
      monthlyRevenue,
      serviceRevenue,
      doctorRevenue,
      totalRevenue: appointments.reduce((sum, a) => sum + a.totalAmount, 0),
      count: appointments.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
