// backend/controllers/creditController.js
import Credit from "../models/creditModel.js";
import Appointment from "../models/appointmentModel.js";

// ✅ Get all credits (for admin)
export const getAllCredits = async (req, res) => {
  try {
    const credits = await Credit.find().populate("user", "name email");
    res.json(credits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get single patient credit
export const getCreditByUser = async (req, res) => {
  try {
    const credit = await Credit.findOne({ user: req.params.userId }).populate("user", "name email");
    if (!credit) return res.status(404).json({ message: "Credit record not found" });
    res.json(credit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Add credit automatically when appointment completed
export const addCreditFromAppointment = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return;

    const amountToAdd = appointment.totalPrice || 0;

    let credit = await Credit.findOne({ user: appointment.user });
    if (!credit) {
      credit = await Credit.create({ user: appointment.user });
    }

    credit.amount += amountToAdd;
    credit.history.push({
      appointment: appointment._id,
      change: amountToAdd,
      note: "Added from completed appointment",
    });

    await credit.save();
    return credit;
  } catch (err) {
    console.error("Error adding credit:", err.message);
  }
};

// ✅ Manually update/deduct credit
export const updateCredit = async (req, res) => {
  try {
    const { userId, amount, note } = req.body; // amount can be negative to deduct

    let credit = await Credit.findOne({ user: userId });
    if (!credit) {
      credit = await Credit.create({ user: userId });
    }

    credit.amount += amount;
    credit.history.push({ change: amount, note });
    await credit.save();

    res.json({ success: true, credit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
