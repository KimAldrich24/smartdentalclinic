import Appointment from "../models/appointmentModel.js";

export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Build filter
    const filter = { status: "completed" };
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const appointments = await Appointment.find(filter)
      .populate("patient", "name")
      .populate("doctor", "name")
      .populate("service", "name price");
    // Format for frontend
    const salesData = appointments.map((appt) => ({
      _id: appt._id,
      date: appt.date,
      patientName: appt.patient?.name || "Unknown",
      serviceName: appt.service?.name || "Unknown Service",
      dentistName: appt.doctor?.name || "Unknown Doctor",
      amount: appt.totalAmount || 0,
    }));
    const totalRevenue = salesData.reduce((sum, s) => sum + s.amount, 0);
    res.json({
      success: true,
      sales: salesData,
      total: totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};