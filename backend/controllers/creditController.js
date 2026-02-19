import Credit from "../models/creditModel.js";
import Appointment from "../models/appointmentModel.js";

export const completeAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "COMPLETED";

    // Find or create patient's credit
    let credit = await Credit.findOne({ patient: appointment.user });
    if (!credit) credit = new Credit({ patient: appointment.user });

    // totalPrice is already calculated by pre-save hook
    const creditAmount = appointment.totalPrice;

    credit.amount += creditAmount;
    credit.history.push({
      appointment: appointment._id,
      change: creditAmount,
      note: "Credit from completed appointment",
    });

    await credit.save();

    // Link appointment to credit
    appointment.creditAdded = credit._id;
    await appointment.save();

    res.json({ message: "Appointment completed and credit added", credit, appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
